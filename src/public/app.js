(() => {
  const money = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
  const one = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const two = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const clp = n => `$${money.format(Math.round(n))}`;
  const kwh = n => `${one.format(n)} kWh`;
  const qs = (root, sel) => root.querySelector(sel);
  const inputNumber = (root, name, fallback = 0) => {
    const el = root.querySelector(`[name="${name}"]`);
    const n = Number(String(el?.value ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
  };
  const write = (root, key, value) => {
    root.querySelectorAll(`[data-out="${key}"]`).forEach(el => { el.textContent = value; });
  };

  document.querySelectorAll('[data-calculator="appliance"]').forEach(root => {
    const update = () => {
      const watts = inputNumber(root, 'watts', 0);
      const hours = inputNumber(root, 'hours', 0);
      const days = inputNumber(root, 'days', 30);
      const price = inputNumber(root, 'price', 0);
      const kwhMonth = watts / 1000 * hours * days;
      const costMonth = kwhMonth * price;
      write(root, 'costMonth', clp(costMonth));
      write(root, 'costYear', clp(costMonth * 12));
      write(root, 'kwhMonth', kwh(kwhMonth));
      write(root, 'kwhYear', kwh(kwhMonth * 12));
      write(root, 'costHour', clp(watts / 1000 * price));
      write(root, 'share250', `${one.format(kwhMonth / 250 * 100)}%`);
    };
    root.addEventListener('input', update);
    root.addEventListener('change', update);
    update();
  });

  document.querySelectorAll('[data-calculator="btu"]').forEach(root => {
    const update = () => {
      const area = inputNumber(root, 'area', 12);
      const height = inputNumber(root, 'height', 2.5);
      const occupants = inputNumber(root, 'occupants', 2);
      const windows = inputNumber(root, 'windows', 2);
      const price = inputNumber(root, 'price', 0);
      const orientation = qs(root, '[name="orientation"]')?.value || 'norte';
      const insulation = qs(root, '[name="insulation"]')?.value || 'normal';
      const mode = qs(root, '[name="mode"]')?.value || 'frio';
      const base = inputNumber(root, mode === 'calefaccion' ? 'baseHeating' : 'baseCooling', 520);
      const heightFactor = Math.max(0.85, height / 2.5);
      const orientationFactor = { norte: 1.2, oriente: 1, poniente: 1.25, sur: 0.75 }[orientation] || 1;
      const insulationFactor = { buena: 0.82, normal: 1, deficiente: 1.22 }[insulation] || 1;
      const windowLoad = mode === 'calefaccion' ? windows * 180 : windows * 240 * orientationFactor;
      const raw = (area * base * heightFactor + Math.max(0, occupants - 2) * 500 + windowLoad) * insulationFactor;
      const sizes = [9000, 12000, 18000, 24000, 30000, 36000, 48000];
      const recommended = sizes.find(size => size >= raw) || Math.ceil(raw / 12000) * 12000;
      const inputKw = recommended / 12000 * 1.09;
      const monthlyKwh = inputKw * 30;
      write(root, 'btu', `${money.format(Math.round(raw))} BTU/h`);
      write(root, 'recommended', `${money.format(recommended)} BTU`);
      write(root, 'thermalKw', `${two.format(raw * 0.000293071)} kW térmicos`);
      write(root, 'inputKw', `${two.format(inputKw)} kW`);
      write(root, 'costMonth', clp(monthlyKwh * price));
      write(root, 'kwhMonth', kwh(monthlyKwh));
    };
    root.addEventListener('input', update);
    root.addEventListener('change', update);
    update();
  });

  document.querySelectorAll('[data-calculator="solar"]').forEach(root => {
    const update = () => {
      const monthlyKwh = inputNumber(root, 'monthlyKwh', 250);
      const coverage = inputNumber(root, 'coverage', 80) / 100;
      const ghi = inputNumber(root, 'ghi', 4.8);
      const price = inputNumber(root, 'price', 220);
      const injection = inputNumber(root, 'injection', 120);
      const panelW = inputNumber(root, 'panelW', 550);
      const selfConsumption = inputNumber(root, 'selfConsumption', 72) / 100;
      const yieldYear = ghi * 365 * 0.78;
      const target = monthlyKwh * 12 * coverage / Math.max(1, yieldYear);
      const panels = Math.max(1, Math.ceil(target * 1000 / Math.max(100, panelW)));
      const kwp = panels * panelW / 1000;
      const generationYear = kwp * yieldYear;
      const costPerWp = kwp <= 2.5 ? 1700 : kwp <= 4.5 ? 1450 : kwp <= 7 ? 1250 : 1080;
      const totalCost = kwp * 1000 * costPerWp + 115877;
      const savingsYear = generationYear * selfConsumption * price + generationYear * (1 - selfConsumption) * injection;
      const payback = savingsYear > 0 ? totalCost / savingsYear : 0;
      write(root, 'kwp', `${two.format(kwp)} kWp`);
      write(root, 'panels', `${money.format(panels)} paneles`);
      write(root, 'generation', `${money.format(Math.round(generationYear))} kWh/año`);
      write(root, 'savings', clp(savingsYear / 12));
      write(root, 'payback', `${one.format(payback)} años`);
      write(root, 'cost', clp(totalCost));
      write(root, 'roof', `${one.format(kwp / 0.22)} m²`);
    };
    root.addEventListener('input', update);
    root.addEventListener('change', update);
    update();
  });

  document.querySelectorAll('[data-jump-select]').forEach(select => {
    select.addEventListener('change', () => {
      if (select.value) window.location.href = select.value;
    });
  });
})();
