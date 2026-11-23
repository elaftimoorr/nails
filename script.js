/* ============================================================
   Luna Nail Studio — Script
   ============================================================ */

'use strict';

/* ---------- [ أدوات مساعدة ] ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- [ سنة التذييل ] ---------- */
$('#year').textContent = `${new Date().getFullYear()} Luna Nail Studio`;

/* ---------- [ الترويسة: تغيّر الشكل عند التمرير ] ---------- */
const header = $('#siteHeader');
const onScrollHeader = () => header.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScrollHeader, { passive: true });
onScrollHeader();

/* ---------- [ قائمة الجوال ] ---------- */
const navToggle = $('#navToggle');
const navMenu = $('#navMenu');

const setMenu = (open) => {
  navMenu.classList.toggle('open', open);
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  document.body.style.overflow = open ? 'hidden' : '';
};

navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));

$$('.nav-link, .btn-nav', navMenu).forEach(link =>
  link.addEventListener('click', () => setMenu(false))
);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) setMenu(false);
});

/* ---------- [ تمييز الرابط النشط في القائمة ] ---------- */
const sections = $$('main section[id]');
const navLinks = $$('.nav-link', navMenu);

const setActiveLink = () => {
  const pos = window.scrollY + 120;
  let current = sections[0]?.id || 'home';
  sections.forEach(sec => {
    if (sec.offsetTop <= pos) current = sec.id;
  });
  navLinks.forEach(link =>
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`)
  );
};
window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

/* ---------- [ الظهور عند التمرير (Reveal) ] ---------- */
const revealEls = $$('.reveal');

if ('IntersectionObserver' in window) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        /* إزالة تأخير الحركة بعد الظهور حتى لا يؤثر على تفاعلات الهوفر */
        setTimeout(() => { entry.target.style.transitionDelay = ''; }, 1000);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el, i) => {
    /* تأخير متتابع خفيف للعناصر المتجاورة */
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    revealObs.observe(el);
  });
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

/* ---------- [ عدّادات الإحصائيات ] ---------- */
const counters = $$('.stat-num');

const runCounter = (el) => {
  const target = +el.dataset.count || 0;
  const dur = 1400;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString('en-US');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

if ('IntersectionObserver' in window) {
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        countObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => countObs.observe(el));
} else {
  counters.forEach(el => (el.textContent = el.dataset.count));
}

/* ---------- [ تصفية المعرض ] ---------- */
const filterBtns = $$('.filter-btn');
const workCards = $$('.work-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let visibleIndex = 0;

    workCards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.classList.remove('is-hidden');
      if (match) {
        /* إعادة تشغيل حركة الظهور */
        card.style.setProperty('--d', `${visibleIndex * 60}ms`);
        card.style.animation = 'none';
        void card.offsetWidth; /* reflow */
        card.style.animation = '';
        visibleIndex++;
      } else {
        card.classList.add('is-hidden');
      }
    });
  });
});

/* ---------- [ شريحة آراء العملاء ] ---------- */
const slider = $('#tSlider');
const track = $('#tTrack');
const slides = $$('.t-card', track);
const dotsWrap = $('#tDots');
let tIndex = 0;
let tTimer = null;

/* إنشاء النقاط */
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 't-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `الرأي ${i + 1}`);
  dot.addEventListener('click', () => goTo(i, true));
  dotsWrap.appendChild(dot);
});
const dots = $$('.t-dot', dotsWrap);

const goTo = (i, manual = false) => {
  tIndex = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${tIndex * 100}%)`;
  dots.forEach((d, di) => d.classList.toggle('active', di === tIndex));
  if (manual) restartAuto();
};

const next = () => goTo(tIndex + 1);
const prev = () => goTo(tIndex - 1);

$('#tNext').addEventListener('click', () => { next(); restartAuto(); });
$('#tPrev').addEventListener('click', () => { prev(); restartAuto(); });

function startAuto() {
  tTimer = setInterval(next, 6000);
}
function restartAuto() {
  clearInterval(tTimer);
  startAuto();
}
slider.addEventListener('mouseenter', () => clearInterval(tTimer));
slider.addEventListener('mouseleave', startAuto);
slider.addEventListener('touchstart', () => clearInterval(tTimer), { passive: true });
slider.addEventListener('touchend', startAuto);

startAuto();

/* ---------- [ زر العودة للأعلى ] ---------- */
const toTop = $('#toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('show', window.scrollY > 600);
}, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- [ التنبيه المنبثق ] ---------- */
const toast = $('#toast');
let toastTimer = null;

const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
};

/* ---------- [ نموذج الحجز ] ---------- */
const form = $('#bookingForm');
const successBox = $('#bookingSuccess');

/* أقل تاريخ ممكن = اليوم */
const dateInput = $('#fDate');
dateInput.min = new Date().toISOString().split('T')[0];

const setError = (inputId, errorId, msg) => {
  const field = $(`#${inputId}`).closest('.field');
  $(`#${errorId}`).textContent = msg;
  field.classList.toggle('invalid', !!msg);
  return !msg;
};

const validators = {
  name: () => {
    const v = $('#fName').value.trim();
    return setError('fName', 'eName',
      v.length < 2 ? 'فضلاً أدخلي اسمكِ (حرفان على الأقل)' : '');
  },
  phone: () => {
    const v = $('#fPhone').value.replace(/[\s-]/g, '');
    const ok = /^(\+?966|0)?5\d{7}$/.test(v) || /^\d{9,15}$/.test(v);
    return setError('fPhone', 'ePhone',
      ok ? '' : 'فضلاً أدخلي رقم جوال صحيح مثل 05X XXX XXXX');
  },
  service: () => {
    const ok = $('#fService').value !== '';
    return setError('fService', 'eService', ok ? '' : 'فضلاً اختاري الخدمة المطلوبة');
  },
  date: () => {
    const v = dateInput.value;
    const ok = v && new Date(v) >= new Date(new Date().toDateString());
    return setError('fDate', 'eDate', ok ? '' : 'فضلاً اختاري تاريخاً صحيحاً (اليوم أو بعده)');
  },
  time: () => {
    const ok = $('#fTime').value !== '';
    return setError('fTime', 'eTime', ok ? '' : 'فضلاً اختاري الوقت المناسب');
  },
};

/* تحقق فوري عند مغادرة الحقل */
Object.keys(validators).forEach(key => {
  const map = { name: 'fName', phone: 'fPhone', service: 'fService', date: 'fDate', time: 'fTime' };
  $(`#${map[key]}`).addEventListener('blur', validators[key]);
  $(`#${map[key]}`).addEventListener('input', () => {
    const field = $(`#${map[key]}`).closest('.field');
    if (field.classList.contains('invalid')) validators[key]();
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const results = Object.values(validators).map(fn => fn());
  if (results.includes(false)) {
    showToast('يرجى تصحيح الحقول المحددة قبل التأكيد');
    $('.field.invalid input, .field.invalid select')?.focus();
    return;
  }

  const booking = {
    name: $('#fName').value.trim(),
    phone: $('#fPhone').value.trim(),
    service: $('#fService').value,
    date: dateInput.value,
    time: $('#fTime').value,
    ref: 'LNS-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
    at: new Date().toISOString(),
  };

  /* حفظ محلي للمواعيد */
  try {
    const saved = JSON.parse(localStorage.getItem('luna_bookings') || '[]');
    saved.push(booking);
    localStorage.setItem('luna_bookings', JSON.stringify(saved));
  } catch (_) { /* تجاهل إن تعذّر الحفظ المحلي */ }

  /* عرض نتيجة النجاح */
  $('#successName').textContent = booking.name;
  $('#successRef').textContent = booking.ref;

  const dateFmt = new Date(booking.date + 'T00:00:00').toLocaleDateString('ar-SA-u-nu-latn', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  $('#successMeta').innerHTML = `
    <span>${booking.service}</span>
    <span>${dateFmt}</span>
    <span>${booking.time}</span>
  `;

  form.hidden = true;
  successBox.hidden = false;
  showToast(`تم استلام حجزكِ بنجاح — رقم الحجز ${booking.ref}`);
});

$('#newBooking').addEventListener('click', () => {
  form.reset();
  $$('.field', form).forEach(f => {
    f.classList.remove('invalid');
    $('.field-error', f).textContent = '';
  });
  successBox.hidden = true;
  form.hidden = false;
  $('#fName').focus();
});
