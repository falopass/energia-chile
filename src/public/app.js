(() => {
  const money = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
  const one = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const two = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const clp = n => `$${money.format(Math.round(n))}`;
  const kwh = n => `${one.format(n)} kWh`;
  const qs = (root, sel) => root.querySelector(sel);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new WeakMap();
  const inputNumber = (root, name, fallback = 0) => {
    const el = root.querySelector(`[name="${name}"]`);
    const n = Number(String(el?.value ?? '').replace(',', '.'));
    const value = Number.isFinite(n) ? n : fallback;
    const min = el?.hasAttribute('min') ? Number(el.min) : 0;
    const max = el?.hasAttribute('max') ? Number(el.max) : Number.MAX_SAFE_INTEGER;
    return Math.min(max, Math.max(min, value));
  };
  const write = (root, key, value) => {
    root.querySelectorAll(`[data-out="${key}"]`).forEach(el => {
      const match = value.match(/^(\$?)([\d.,]+)(.*)$/);
      if (!match) { el.textContent = value; return; }
      const target = Number(match[2].replace(/\./g, '').replace(',', '.'));
      const digits = match[2].includes(',') ? match[2].split(',')[1].length : 0;
      const formatter = new Intl.NumberFormat('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits });
      const startValue = Number(el.dataset.numeric ?? target);
      cancelAnimationFrame(animations.get(el));
      if (reducedMotion.matches || startValue === target) {
        el.textContent = value; el.dataset.numeric = target; return;
      }
      const start = performance.now();
      const frame = now => {
        const progress = Math.min(1, (now - start) / 380);
        const current = startValue + (target - startValue) * (1 - (1 - progress) ** 3);
        el.dataset.numeric = current;
        el.textContent = progress === 1 ? value : match[1] + formatter.format(current) + match[3];
        if (progress < 1) animations.set(el, requestAnimationFrame(frame));
      };
      animations.set(el, requestAnimationFrame(frame));
    });
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
      const comparison = root.querySelector('[data-bill]');
      const bill = Number(comparison?.dataset.bill);
      if (bill > 0) {
        write(root, 'billShare', `${one.format(costMonth / bill * 100)}%`);
        comparison.querySelector('[data-appliance-meter]').style.setProperty('--fill', `${Math.min(100, costMonth / bill * 100)}%`);
      }
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

  document.querySelectorAll('[data-commune-picker]').forEach(picker => {
    const search = picker.querySelector('[data-commune-search]');
    const select = picker.querySelector('[data-jump-select]');
    const options = Array.from(select.options).slice(1).map(option => option.cloneNode(true));
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    search.addEventListener('input', () => {
      const query = normalize(search.value);
      const filtered = options.filter(option => normalize(option.textContent).includes(query));
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = filtered.length ? 'Selecciona una comuna…' : 'Sin resultados, prueba otro nombre';
      select.replaceChildren(placeholder, ...filtered.map(option => {
        const copy = option.cloneNode(true); copy.selected = false; return copy;
      }));
      select.value = '';
      picker.querySelector('[data-search-status]').textContent = `${filtered.length} comunas disponibles`;
    });
    search.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (select.options.length === 2) window.location.href = select.options[1].value;
        else select.focus();
      }
    });
  });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending', 'motion-pending');
        entry.target.classList.add('motion-ready');
        reveal.unobserve(entry.target);
      });
    }, { threshold: .08 });
    document.querySelectorAll('.tool-card,.section-head,.sidebar .card,.chart,.comparison-bars').forEach((el, index) => {
      el.style.setProperty('--reveal-delay', `${index % 3 * 60}ms`);
      el.classList.add('reveal-ready', 'reveal-pending');
      if (el.matches('.chart,.comparison-bars')) el.classList.add('motion-pending');
      reveal.observe(el);
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        reveal.disconnect();
        document.querySelectorAll('.reveal-pending,.motion-pending').forEach(el => el.classList.remove('reveal-pending', 'motion-pending'));
      }
    });
  }
})();
