/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrentBusinessId, supabase } from '../lib/supabaseClient';

// ============================================================
// TYPES
// ============================================================
export type WeeklyReportData = {
  weekKey: string;
  label: string;
  startISO: string;
  endISO: string;

  totalSales: number;
  totalPaymentsReceived: number;
  outstandingBalances: number;

  totalPurchases: number;
  totalExpenses: number;

  netProfitLoss: number;

  paymentsByMethod: Record<string, number>;

  partialPaymentsReceived: number;
  amountStillDue: number;

  topSellingProducts: Array<{ name: string; qty: number; revenue: number }>;

  generatedAt: string;

  /** demo report (added by the page, never by this service) */
  isSample?: boolean;
  /** the week that is still running (updates automatically) */
  isLive?: boolean;
};

export type LoadResult = {
  reports: WeeklyReportData[];
  /** true when the shown numbers could not be confirmed by the server (offline / network problem) */
  fromCache: boolean;
  /** when the server numbers were last calculated (null = never) */
  savedAt?: string | null;
};

type ElectronDb = {
  dbQuery: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
  dbRun: (
    sql: string,
    params?: unknown[]
  ) => Promise<{ changes: number; lastInsertRowid?: number | bigint }>;
};

const api = (): ElectronDb => {
  const win = window as unknown as { api?: ElectronDb; electronAPI?: ElectronDb };
  const dbApi = win.api ?? win.electronAPI;
  if (!dbApi) throw new Error('Database API is not available on window');
  return dbApi;
};

// ============================================================
// EVENTS (the page listens to these)
// ============================================================
/** New numbers are available (after a background refresh) → page should call load() again */
export const REPORTS_UPDATED_EVENT = 'zakhira:reports-updated';
/** The refresh failed for a reason other than "offline" */
export const REPORTS_SYNC_ERROR_EVENT = 'zakhira:reports-sync-error';

// ============================================================
// 📅 WEEK HELPERS (Saturday → Friday) — also used by the page
// ============================================================
const pad2 = (n: number): string => String(n).padStart(2, '0');

const offsetFromSaturday = (day: number): number => (day + 1) % 7;

export const getWeekKey = (saturdayStart: Date): string =>
  `${saturdayStart.getFullYear()}-${pad2(saturdayStart.getMonth() + 1)}-${pad2(
    saturdayStart.getDate()
  )}`;

export const formatWeekLabel = (start: Date, end: Date): string => {
  const fmt = (d: Date): string =>
    d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  return `${fmt(start)} – ${fmt(end)}`;
};

export const getWeekRange = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const offset = offsetFromSaturday(d.getDay());

  const start = new Date(d);
  start.setDate(d.getDate() - offset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    weekKey: getWeekKey(start),
    start,
    end,
    label: formatWeekLabel(start, end),
  };
};

export const getLastClosedWeek = (now: Date = new Date()) => {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diffToFriday = (today.getDay() + 2) % 7;
  const lastFriday = new Date(today);
  lastFriday.setDate(today.getDate() - diffToFriday);
  return getWeekRange(lastFriday);
};

/** 'YYYY-MM-DD' (database DATE) → local Date at midnight (no timezone shift) */
const parseDay = (s: string): Date => {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

// ============================================================
// SMALL UTILITIES
// ============================================================
const BUSINESS_ID_KEY = 'zakhira_business_id';
const LEGACY_CACHE_PREFIX = 'zakhira_weekly_reports_v1:';
/** how many weeks back are calculated (keeps the queries small) */
const MAX_WEEKS = 104;
const PAGE = 1000;
const REFRESH_EVERY_MS = 5 * 60 * 1000; // background recalculation
const MIN_REFRESH_GAP_MS = 30 * 1000; // never hammer the server
const EVENT_DEBOUNCE_MS = 3000;

const getBusinessId = async (): Promise<string> => {
  const cached = localStorage.getItem(BUSINESS_ID_KEY);
  if (cached) return cached;
  const id = (await getCurrentBusinessId()) as string;
  localStorage.setItem(BUSINESS_ID_KEY, id);
  return id;
};

const isNetworkError = (err: unknown): boolean => {
  const msg = String((err as { message?: string })?.message ?? err).toLowerCase();
  return [
    'failed to fetch',
    'fetch failed',
    'networkerror',
    'network request failed',
    'load failed',
    'err_internet_disconnected',
    'err_network',
    'timed out',
    'timeout',
  ].some((k) => msg.includes(k));
};

// Money is added in whole cents (integers) so there are no floating point errors.
const toCents = (n: unknown): number => Math.round((Number(n) + Number.EPSILON) * 100) || 0;
const fromCents = (c: number): number => c / 100;

// Supabase returns max 1000 rows per request -> page through everything.
async function fetchAll(
  build: (
    from: number,
    to: number
  ) => PromiseLike<{ data: any[] | null; error: any }>
): Promise<any[]> {
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

const reportsSignature = (reports: WeeklyReportData[]): string =>
  JSON.stringify(reports.map((r) => ({ ...r, generatedAt: '' })));

// ============================================================
// LOCAL STORAGE (SQLite) — one snapshot row per business
// ============================================================
let tableReady: Promise<void> | null = null;

const ensureTable = (): Promise<void> => {
  if (!tableReady) {
    tableReady = api()
      .dbRun(
        `CREATE TABLE IF NOT EXISTS report_snapshots (
           business_id TEXT PRIMARY KEY,
           payload     TEXT NOT NULL,
           saved_at    TEXT NOT NULL
         )`
      )
      .then(() => undefined)
      .catch((err) => {
        tableReady = null;
        throw err;
      });
  }
  return tableReady;
};

type Snapshot = { reports: WeeklyReportData[]; savedAt: string };

const readSnapshot = async (businessId: string): Promise<Snapshot | null> => {
  const rows = await api().dbQuery<{ payload: string; saved_at: string }>(
    `SELECT payload, saved_at FROM report_snapshots WHERE business_id = ?`,
    [businessId]
  );
  if (!rows[0]) return null;
  try {
    const parsed = JSON.parse(rows[0].payload);
    return Array.isArray(parsed?.reports)
      ? { reports: parsed.reports as WeeklyReportData[], savedAt: rows[0].saved_at }
      : null;
  } catch {
    return null;
  }
};

const writeSnapshot = async (
  businessId: string,
  reports: WeeklyReportData[]
): Promise<string> => {
  const savedAt = new Date().toISOString();
  await api().dbRun(
    `INSERT INTO report_snapshots (business_id, payload, saved_at)
     VALUES (?, ?, ?)
     ON CONFLICT(business_id) DO UPDATE SET
       payload = excluded.payload,
       saved_at = excluded.saved_at`,
    [businessId, JSON.stringify({ reports }), savedAt]
  );
  return savedAt;
};

/** reports saved by the old (localStorage) version — used once, then they live in SQLite */
const readLegacyCache = (): WeeklyReportData[] | null => {
  try {
    const id = localStorage.getItem(BUSINESS_ID_KEY);
    if (!id) return null;
    const raw = localStorage.getItem(LEGACY_CACHE_PREFIX + id);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.reports) ? (parsed.reports as WeeklyReportData[]) : null;
  } catch {
    return null;
  }
};

/**
 * Purchases of RECEIVED orders from the local orders table (weekKey → cents).
 * Includes orders received offline that the server has not seen yet.
 */
const readLocalPurchases = async (businessId: string): Promise<Map<string, number>> => {
  const map = new Map<string, number>();
  try {
    const rows = await api().dbQuery<{ order_date: string; total_amount: number }>(
      `SELECT order_date, total_amount FROM po_orders
        WHERE business_id = ? AND status = 'Received'`,
      [businessId]
    );
    for (const r of rows) {
      const key = getWeekRange(parseDay(r.order_date)).weekKey;
      map.set(key, (map.get(key) ?? 0) + toCents(r.total_amount));
    }
  } catch {
    /* orders table not created yet → nothing local */
  }
  return map;
};

/** weekKey of a saved report (the live week is stored as "live-<weekKey>") */
const reportStartKey = (r: WeeklyReportData): string => {
  const d = new Date(r.startISO);
  return isNaN(d.getTime()) ? r.weekKey.replace(/^live-/, '') : getWeekKey(d);
};

/**
 * Server numbers stay as they are, except purchases: the bigger of
 * (server, local received orders) wins, so a receive done offline shows at once.
 */
const withLocalPurchases = (
  reports: WeeklyReportData[],
  local: Map<string, number>
): WeeklyReportData[] =>
  reports.map((r) => {
    const localC = local.get(reportStartKey(r)) ?? 0;
    if (localC <= toCents(r.totalPurchases)) return r;
    const purchases = fromCents(localC);
    return {
      ...r,
      totalPurchases: purchases,
      netProfitLoss: fromCents(
        toCents(r.totalSales) - localC - toCents(r.totalExpenses)
      ),
    };
  });

// ============================================================
// 📊 CALCULATION (everything is derived from existing tables)
// ============================================================
type Acc = {
  sales: number; // invoices (Approved)
  returns: number; // sales returns
  received: number; // payments received (accounting 'In')
  partialReceived: number; // received on invoices that are still partially paid
  outstanding: number; // balance due of the week's invoices
  dueOnPartial: number; // balance due of partially paid invoices
  purchases: number; // purchase orders (Received)
  expenses: number;
  methods: Record<string, number>;
  products: Map<string, { qty: number; revenue: number }>;
};

const newAcc = (): Acc => ({
  sales: 0,
  returns: 0,
  received: 0,
  partialReceived: 0,
  outstanding: 0,
  dueOnPartial: 0,
  purchases: 0,
  expenses: 0,
  methods: {},
  products: new Map(),
});

/** one report per week: first data week → current (running) week */
const buildReports = (
  accs: Map<string, Acc>,
  earliestKey: string
): WeeklyReportData[] => {
  if (!earliestKey) return [];

  const current = getWeekRange(new Date());
  const generatedAt = new Date().toISOString();
  const reports: WeeklyReportData[] = [];
  const cursor = parseDay(earliestKey);

  while (cursor.getTime() <= current.start.getTime()) {
    const w = getWeekRange(cursor);
    const acc = accs.get(w.weekKey) ?? newAcc();
    const isLive = w.weekKey === current.weekKey;

    const totalSalesC = acc.sales - acc.returns;
    const netC = totalSalesC - acc.purchases - acc.expenses;

    const methods: Record<string, number> = {};
    Object.entries(acc.methods).forEach(([m, c]) => {
      methods[m] = fromCents(c);
    });

    reports.push({
      weekKey: isLive ? `live-${w.weekKey}` : w.weekKey,
      label: w.label,
      startISO: w.start.toISOString(),
      endISO: w.end.toISOString(),
      totalSales: fromCents(totalSalesC),
      totalPaymentsReceived: fromCents(acc.received),
      outstandingBalances: fromCents(acc.outstanding),
      totalPurchases: fromCents(acc.purchases),
      totalExpenses: fromCents(acc.expenses),
      netProfitLoss: fromCents(netC),
      paymentsByMethod: methods,
      partialPaymentsReceived: fromCents(acc.partialReceived),
      amountStillDue: fromCents(acc.dueOnPartial),
      topSellingProducts: Array.from(acc.products.entries())
        .map(([name, v]) => ({ name, qty: v.qty, revenue: fromCents(v.revenue) }))
        .sort((x, y) => y.qty - x.qty)
        .slice(0, 10),
      generatedAt,
      isSample: false,
      isLive,
    });

    cursor.setDate(cursor.getDate() + 7);
  }

  reports.sort((x, y) => new Date(y.startISO).getTime() - new Date(x.startISO).getTime());
  return reports;
};

/** server calculation (needs internet) */
const computeFromServer = async (
  businessId: string
): Promise<WeeklyReportData[]> => {
  const current = getWeekRange(new Date());
  const from = new Date(current.start);
  from.setDate(from.getDate() - (MAX_WEEKS - 1) * 7);
  const fromStr = getWeekKey(from);

  const [docs, returns, payments, orders, expenses] = await Promise.all([
    // invoices that count as sales (+ their lines for "top products")
    fetchAll((a, b) =>
      supabase
        .from('sales_documents')
        .select(
          'id, issue_date, grand_total, balance_due, payment_status, lines:sales_document_lines(material, quantity, line_total)'
        )
        .eq('business_id', businessId)
        .eq('document_type', 'invoice')
        .eq('status', 'Approved')
        .gte('issue_date', fromStr)
        .order('id')
        .range(a, b)
    ),
    fetchAll((a, b) =>
      supabase
        .from('sales_returns')
        .select('id, return_date, total_return_amount')
        .eq('business_id', businessId)
        .gte('return_date', fromStr)
        .order('id')
        .range(a, b)
    ),
    // money received from customers
    fetchAll((a, b) =>
      supabase
        .from('accounting_transactions')
        .select('id, txn_date, amount, status, mode')
        .eq('business_id', businessId)
        .eq('type', 'In')
        .gte('txn_date', fromStr)
        .order('id')
        .range(a, b)
    ),
    // purchases = orders that were received
    fetchAll((a, b) =>
      supabase
        .from('purchase_orders')
        .select('id, order_date, total_amount')
        .eq('business_id', businessId)
        .eq('status', 'Received')
        .gte('order_date', fromStr)
        .order('id')
        .range(a, b)
    ),
    fetchAll((a, b) =>
      supabase
        .from('expenses')
        .select('id, expense_date, amount')
        .eq('business_id', businessId)
        .gte('expense_date', fromStr)
        .order('id')
        .range(a, b)
    ),
  ]);

  // ---- bucket every row into its Saturday→Friday week ----
  const accs = new Map<string, Acc>();
  const memo = new Map<string, string>();
  let earliestKey = '';

  const bucket = (dateStr: string): Acc => {
    const day = String(dateStr).slice(0, 10);
    let key = memo.get(day);
    if (!key) {
      key = getWeekRange(parseDay(day)).weekKey;
      memo.set(day, key);
    }
    if (!earliestKey || key < earliestKey) earliestKey = key;
    let acc = accs.get(key);
    if (!acc) {
      acc = newAcc();
      accs.set(key, acc);
    }
    return acc;
  };

  for (const d of docs) {
    const acc = bucket(d.issue_date);
    acc.sales += toCents(d.grand_total);
    acc.outstanding += toCents(d.balance_due);
    if (d.payment_status === 'Partially Paid') acc.dueOnPartial += toCents(d.balance_due);
    for (const l of (d.lines as any[]) || []) {
      const name = String(l.material || '').trim() || 'Unknown';
      const cur = acc.products.get(name) ?? { qty: 0, revenue: 0 };
      cur.qty += Number(l.quantity) || 0;
      cur.revenue += toCents(l.line_total);
      acc.products.set(name, cur);
    }
  }

  for (const r of returns) {
    bucket(r.return_date).returns += toCents(r.total_return_amount);
  }

  for (const p of payments) {
    const acc = bucket(p.txn_date);
    const cents = toCents(p.amount);
    acc.received += cents;
    const mode = p.mode || 'Other';
    acc.methods[mode] = (acc.methods[mode] ?? 0) + cents;
    if (p.status === 'Partially Paid') acc.partialReceived += cents;
  }

  for (const o of orders) {
    bucket(o.order_date).purchases += toCents(o.total_amount);
  }

  for (const e of expenses) {
    bucket(e.expense_date).expenses += toCents(e.amount);
  }

  // no data at all → no real reports (the page may still show demo ones)
  return buildReports(accs, earliestKey);
};

/** reports made ONLY from local orders (first launch while offline) */
const buildFromLocalPurchases = (local: Map<string, number>): WeeklyReportData[] => {
  const accs = new Map<string, Acc>();
  let earliestKey = '';
  local.forEach((cents, key) => {
    const acc = newAcc();
    acc.purchases = cents;
    accs.set(key, acc);
    if (!earliestKey || key < earliestKey) earliestKey = key;
  });
  return buildReports(accs, earliestKey);
};

// ============================================================
// SERVICE STATE
// ============================================================
let memReports: WeeklyReportData[] | null = null;
let serverFailed = false; // last refresh could not reach the server
let lastRefreshAt = 0;
let refreshing: Promise<LoadResult> | null = null;
let loading: Promise<LoadResult> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let debounce: ReturnType<typeof setTimeout> | null = null;
const reportedErrors = new Set<string>();

const reportError = (err: unknown): void => {
  const e = err as { message?: string; details?: string; code?: string };
  const message = e?.message || String(err);
  if (reportedErrors.has(message)) return;
  reportedErrors.add(message);
  console.error('[ReportsSync]', err);
  window.dispatchEvent(
    new CustomEvent(REPORTS_SYNC_ERROR_EVENT, {
      detail: { message, details: e?.details, code: e?.code },
    })
  );
};

const isOffline = (): boolean =>
  typeof navigator !== 'undefined' && !navigator.onLine;

// ============================================================
// LOAD (local first) + REFRESH (server → SQLite)
// ============================================================
/** Instant: SQLite snapshot + local purchases. Never waits for the network. */
const readLocalResult = async (): Promise<LoadResult & { hasData: boolean }> => {
  await ensureTable();
  const businessId = await getBusinessId().catch(() => null);
  if (!businessId) {
    return { reports: [], fromCache: true, savedAt: null, hasData: false };
  }

  let snap = await readSnapshot(businessId);

  // one-time migration of the old localStorage cache
  if (!snap) {
    const legacy = readLegacyCache();
    if (legacy && legacy.length > 0) {
      const savedAt = await writeSnapshot(businessId, legacy);
      snap = { reports: legacy, savedAt };
    }
  }

  const local = await readLocalPurchases(businessId);
  let reports: WeeklyReportData[];
  let hasData = true;

  if (snap) {
    reports = withLocalPurchases(snap.reports, local);
  } else if (local.size > 0) {
    reports = buildFromLocalPurchases(local);
  } else {
    reports = [];
    hasData = false;
  }

  memReports = reports;
  return {
    reports,
    fromCache: isOffline() || serverFailed,
    savedAt: snap?.savedAt ?? null,
    hasData,
  };
};

/**
 * Recalculates from the server and stores the result in SQLite.
 * Single-flight. Offline → returns the local numbers. Fires
 * REPORTS_UPDATED_EVENT only when the numbers really changed.
 */
const refresh = (): Promise<LoadResult> => {
  if (refreshing) return refreshing;

  refreshing = (async (): Promise<LoadResult> => {
    if (isOffline()) {
      serverFailed = true;
      const { hasData: _h, ...res } = await readLocalResult();
      return res;
    }

    try {
      await ensureTable();
      const businessId = await getBusinessId();
      const before = await readSnapshot(businessId);
      const fresh = await computeFromServer(businessId);

      const savedAt = await writeSnapshot(businessId, fresh);
      lastRefreshAt = Date.now();
      serverFailed = false;
      reportedErrors.clear();

      const local = await readLocalPurchases(businessId);
      const reports = withLocalPurchases(fresh, local);
      memReports = reports;

      const changed =
        !before || reportsSignature(before.reports) !== reportsSignature(fresh);
      if (changed) window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT));

      return { reports, fromCache: false, savedAt };
    } catch (err) {
      lastRefreshAt = Date.now();
      if (isNetworkError(err)) {
        serverFailed = true;
      } else {
        reportError(err);
      }
      const { hasData: _h, ...res } = await readLocalResult();
      return res;
    }
  })().finally(() => {
    refreshing = null;
  });

  return refreshing;
};

const refreshIfDue = (): void => {
  if (isOffline()) return;
  if (Date.now() - lastRefreshAt < MIN_REFRESH_GAP_MS) return;
  void refresh();
};

const refreshSoon = (): void => {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    debounce = null;
    refreshIfDue();
  }, EVENT_DEBOUNCE_MS);
};

// ============================================================
// SERVICE
// ============================================================
export const reportsService = {
  /** Last known reports — synchronous, for an instant first paint (null on first launch). */
  getCached(): WeeklyReportData[] | null {
    return memReports ?? readLegacyCache();
  },

  /**
   * Reports for the page — LOCAL FIRST (instant, works offline).
   * A background refresh from the server is started when needed and the page
   * is told through REPORTS_UPDATED_EVENT. Only on the very first launch
   * (nothing saved yet) and while online does this wait for the server.
   */
  load(): Promise<LoadResult> {
    if (!loading) {
      loading = (async (): Promise<LoadResult> => {
        const local = await readLocalResult();

        if (!local.hasData && !isOffline()) {
          return refresh(); // first launch: nothing to show yet
        }

        const stale = Date.now() - lastRefreshAt > REFRESH_EVERY_MS;
        if (!isOffline() && (stale || serverFailed)) void refresh();

        const { hasData: _h, ...res } = local;
        return res;
      })().finally(() => {
        loading = null;
      });
    }
    return loading;
  },

  /** Force a recalculation from the server now (e.g. a "Refresh" button). */
  refresh(): Promise<LoadResult> {
    return refresh();
  },

  /** Starts background refreshing (idempotent). Safe to call from the page or App.tsx. */
  startSyncWorker(): void {
    if (timer) return;
    timer = setInterval(refreshIfDue, REFRESH_EVERY_MS);
    window.addEventListener('online', () => {
      serverFailed = false;
      void refresh();
    });
    window.addEventListener('focus', refreshIfDue);
    // data that feeds the reports changed somewhere in the app
    [
      'zakhira:orders-synced',
      'zakhira:sales-updated',
      'zakhira:inventory-updated',
      'zakhira:accounting-updated',
    ].forEach((n) => window.addEventListener(n, refreshSoon));
    refreshIfDue();
  },
};