export const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
export const nf1 = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const nf2 = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function clp(value, digits = 0) {
  return `$${new Intl.NumberFormat('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)}`;
}

export function num(value, digits = 1) {
  return new Intl.NumberFormat('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

export function pct(value, digits = 0) {
  return `${num(value * 100, digits)}%`;
}

export function slugify(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/ñ/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function applianceCalculation({ watts, hoursPerDay, priceKwh, daysPerMonth = 30 }) {
  const kwhMonth = watts / 1000 * hoursPerDay * daysPerMonth;
  const costMonth = kwhMonth * priceKwh;
  return {
    kwhMonth,
    costMonth,
    kwhYear: kwhMonth * 12,
    costYear: costMonth * 12,
    costHour: watts / 1000 * priceKwh,
    share250: kwhMonth / 250
  };
}

export function btuCalculation({ areaM2, heightM = 2.5, occupants = 2, windowsM2 = 2, orientation = 'norte', insulation = 'normal', climate, priceKwh, mode = 'frio' }) {
  const base = mode === 'calefaccion' ? climate.heatingBaseBtuhM2 : climate.coolingBaseBtuhM2;
  const heightFactor = Math.max(0.85, heightM / 2.5);
  const peopleLoad = Math.max(0, occupants - 2) * 500;
  const orientationFactor = { norte: 1.2, oriente: 1, poniente: 1.25, sur: 0.75 }[orientation] || 1;
  const insulationFactor = { buena: 0.82, normal: 1, deficiente: 1.22 }[insulation] || 1;
  const envelope = areaM2 * base * heightFactor;
  const windowLoad = mode === 'calefaccion' ? windowsM2 * 180 : windowsM2 * 240 * orientationFactor;
  const raw = (envelope + peopleLoad + windowLoad) * insulationFactor;
  const sizes = [9000, 12000, 18000, 24000, 30000, 36000, 48000];
  const recommended = sizes.find(size => size >= raw) || Math.ceil(raw / 12000) * 12000;
  const inputKw = recommended / 12000 * 1.09;
  const monthlyKwh30h = inputKw * 30;
  return {
    base,
    raw,
    recommended,
    frigorias: raw / 3.968,
    thermalKw: raw * 0.000293071,
    inputKw,
    monthlyKwh30h,
    monthlyCost30h: monthlyKwh30h * priceKwh
  };
}

export function solarCostPerWp(kwp) {
  if (kwp <= 2.5) return 1700;
  if (kwp <= 4.5) return 1450;
  if (kwp <= 7) return 1250;
  return 1080;
}

export function solarCalculation({ monthlyKwh, coverage = 0.8, ghiDay, priceKwh, injectionKwh, panelW = 550, selfConsumption = 0.72, costPerWp }) {
  const performanceRatio = 0.78;
  const yieldKwpYear = ghiDay * 365 * performanceRatio;
  const targetKwpRaw = monthlyKwh * 12 * coverage / yieldKwpYear;
  const panels = Math.max(1, Math.ceil(targetKwpRaw * 1000 / panelW));
  const installedKwp = panels * panelW / 1000;
  const generationYear = installedKwp * yieldKwpYear;
  const generationMonth = generationYear / 12;
  const rate = costPerWp || solarCostPerWp(installedKwp);
  const equipmentCost = installedKwp * 1000 * rate;
  const connectionCost = 115877;
  const totalCost = equipmentCost + connectionCost;
  const selfKwh = generationYear * selfConsumption;
  const injectedKwh = generationYear * (1 - selfConsumption);
  const savingsYear = selfKwh * priceKwh + injectedKwh * injectionKwh;
  const savingsMonth = savingsYear / 12;
  const paybackYears = savingsYear > 0 ? totalCost / savingsYear : Infinity;
  const roofM2 = installedKwp / 0.22;
  return {
    targetKwpRaw,
    panels,
    installedKwp,
    generationYear,
    generationMonth,
    equipmentCost,
    connectionCost,
    totalCost,
    savingsYear,
    savingsMonth,
    paybackYears,
    roofM2,
    coverageReal: generationYear / (monthlyKwh * 12),
    yieldKwpYear,
    selfKwh,
    injectedKwh
  };
}

export function monthlyBillEstimate({ marginalKwh, fixedMonthly, kwh = 250 }) {
  return marginalKwh * kwh + fixedMonthly;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
