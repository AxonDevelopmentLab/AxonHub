let CACHE = {
  ProcessID: '',
  plan: '',
  price: 0,
  duration: 1,
  payment_method: 'PIX',
  promotional_code: '',
  promotional_discount: 0,
  payment_code: ''
};

const PLAN_PRICE = document.getElementById('plan.price');
const DISCOUT_VALUE = document.getElementById('discount.value');
const SUBTOTAL_PRICE = document.getElementById('subtotal.price')
const DISCOUNT_INPUT = document.getElementById('discount.input')

if (!localStorage.getItem('auth_token')) {
  redirect('account?changetype=true&redirectTo=https://axonhub.glitch.me/store/checkout')
} else {
    if (!localStorage.getItem('shopping.cart')) {
      redirect('store');
    } else {
      const GETPLAN = localStorage.getItem('shopping.cart');
      localStorage.removeItem('shopping.cart');
      selectPlan(GETPLAN);
      document.getElementById('checkout.request').style.display = "block";
    }
};

$.post(`https://axon-api.glitch.me/account/get`, { token: localStorage.getItem('auth_token'), services: ['account'] }).done(function (data) {
  document.getElementById('account.email').value = data.services.account.email;
}).fail(function (failed) { redirect('store'); })

function selectPlan(PlanName) {
  const plans = {
    'axonplus': 14.99
  };
  
  if (!Object.keys(plans).includes(PlanName)) return selectPlan('axonplus');
  document.getElementById('plan.duration').value = '1';
  document.getElementById('plans.list').value = PlanName;
  
  CACHE.plan = PlanName;
  CACHE.price = plans[PlanName];
  subtotalCalculator();
};

const DurationElement = document.getElementById('plan.duration');
DurationElement.addEventListener('change', function() {
  const DurationValue = DurationElement.options[DurationElement.selectedIndex].value;
  CACHE.duration = Number(DurationValue);
  subtotalCalculator();
});

const PlansElement = document.getElementById('plans.list');
PlansElement.addEventListener('change', function() {
  const PlanName = PlansElement.options[PlansElement.selectedIndex].value;
  selectPlan(PlanName);
});


function subtotalCalculator() {
  PLAN_PRICE.innerHTML = `R$ ${CACHE.price} × ${CACHE.duration} (Meses)`;
  
  let SUBTOTAL = CACHE.price * CACHE.duration;
  let DiscountText = "";
  
  if (CACHE.promotional_discount !== 0) {
    DISCOUT_VALUE.innerHTML = `Desconto de <b>${CACHE.promotional_discount}%</b> aplicado.`
    
    DiscountText = ` <b>Com Desconto</b>`;
    SUBTOTAL = (SUBTOTAL / 100) * (100 - CACHE.promotional_discount);
  };
  
  const SUBTOTAL_Text = 'R$ ' + SUBTOTAL.toFixed(2) + DiscountText;
  SUBTOTAL_PRICE.innerHTML = SUBTOTAL_Text
};

DISCOUNT_INPUT.addEventListener('keydown', (e) => { if (e.key === 'Enter') {
  DISCOUNT_INPUT.disabled = true;
  
  $.post(`https://axon-api.glitch.me/store/checkout/discount`, { discount: DISCOUNT_INPUT.value }).done(function (data) {
    if (data.status === 400) { DISCOUNT_INPUT.disabled = false; return alert('Código promocional inválido.'); }
    if (data.status === 200) {
      alert('Código promocional aplicado com sucesso.');
      CACHE.promotional_code = DISCOUNT_INPUT.value;
      CACHE.promotional_discount = data.discount;
      subtotalCalculator();
    }
  }).fail(function (failed) {
    DISCOUNT_INPUT.disabled = false;
    return alert('Não foi possível aplicar o desconto.');
  })

  e.preventDefault();
}});

function endCheckout() {
  const GenerateBuyRequest = {
    token: localStorage.getItem('auth_token'),
    plan: CACHE.plan,
    duration: CACHE.duration,
    payment_method: CACHE.payment_method,
    discount: CACHE.promotional_code
  };
  
  $.post(`https://axon-api.glitch.me/store/checkout/create`, GenerateBuyRequest).done(function (data) {
    if (data.status === 400) {
      alert(data.message);
      return redirect('/');
    };
    
    if (data.status === 200) {
      CACHE.ProcessID = data.processid;
      document.getElementById('qrcode.img').src = `data:image/png;base64,` + data.payment.qrcode;
      CACHE.payment_code = data.payment.code;
      checkPaymentStatus();
    }
    
    console.log(data)
  }).fail(function (failed) {
    return alert('Não foi possível finalizar a sua compra, entre em contato com o suporte.');
    redirect('/')
  })
  
  let i = 0;
  const awaitingForPayment = setInterval(() => {
    if (document.getElementById('checkout.pay').style.display) {
      i++;
      if (i === 4) i = 0;
      document.getElementById('awaiting.payment').innerHTML = `Aguardando pagamento${".".repeat(i)}`;
    } else {
     clearInterval(awaitingForPayment); 
    }
  }, 650)
  
  document.getElementById('checkout.request').style.display = "none";
  document.getElementById('checkout.pay').style.display = "block";
};

function checkPaymentStatus() {
  const loop = setInterval(() => {
    $.post(`https://axon-api.glitch.me/store/checkout/status`, { token: localStorage.getItem('auth_token'), processid: CACHE.ProcessID }).done(function (data) {
      if (data.status === 403) return alert('Não foi possível localizar o seu pedido no banco de dados. Envie o seu comprovante de pagamento para o suporte realizar o processo de reembolso.');
      if (data.status === 200) {
        clearInterval(loop);
        document.getElementById('sucess.planname').innerHTML = data.planname;
        paymentApproved();
      }
    }).fail(function (failed) {
      return alert('Não foi possível localizar o seu pedido no banco de dados. Envie o seu comprovante de pagamento para o suporte realizar o processo de reembolso.');
    })
  }, 10000);
};

function copyPixKey() {
  navigator.clipboard.writeText(CACHE.payment_code).then(() => {
    alert('A Chave PIX foi copiada com sucesso.')
  }).catch((err) => {
    alert('Ocorreu um erro ao copiar a Chave PIX.');
  });
}

function paymentApproved() {
  document.getElementById('checkout.pay').style.display = "none";
  document.getElementById('checkout.sucess').style.display = "block";
};