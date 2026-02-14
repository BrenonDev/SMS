let numeros = [];

const senhaInput = document.getElementById("senha");
const inputNumero = document.getElementById("numero");
const lista = document.getElementById("listaNumeros");
const selectMensagem = document.getElementById("mensagem");
const preview = document.getElementById("previewMensagem");
const whatsappInput = document.getElementById("whatsapp");
const vagaInput = document.getElementById("vaga");
const form = document.getElementById("formulario");
const botaoEnviar = document.querySelector(".enviar");

let enviando = false;
const textoOriginalBotao = botaoEnviar.innerHTML;

function setLoading(ativo) {
  if (ativo) {
    botaoEnviar.disabled = true;
    botaoEnviar.innerHTML = "Enviando... ⏳";
  } else {
    botaoEnviar.disabled = false;
    botaoEnviar.innerHTML = textoOriginalBotao;
    enviando = false;
  }
}

form.addEventListener("submit", function(e) {
  e.preventDefault();
});

selectMensagem.addEventListener("change", atualizarPreview);
whatsappInput.addEventListener("input", () => {
  aplicarMascara(whatsappInput);
  atualizarPreview();
});
vagaInput.addEventListener("input", atualizarPreview);

inputNumero.addEventListener("input", () => {
  aplicarMascara(inputNumero);
});

inputNumero.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    adicionarNumero();
  }
});

botaoEnviar.addEventListener("click", async function () {
  if (enviando) return;

  if (selectMensagem.value === "") {
    alert("Selecione uma mensagem.");
    return;
  }

  if (whatsappInput.value.trim() === "") {
    alert("Informe o WhatsApp de retorno.");
    return;
  }

  if (numeros.length === 0) {
    alert("Adicione um número.");
    return;
  }

  let whatsappLimpo = whatsappInput.value.replace(/\D/g, "").trim();
  if (whatsappLimpo.length === 11) whatsappLimpo = "55" + whatsappLimpo;

  const linkWhatsapp = `https://wa.me/${whatsappLimpo}`;

  let mensagemFinal = selectMensagem.value.trim()
    .replace("{whatsapp}", whatsappInput.value.trim())
    .replace("{vaga}", vagaInput.value.trim() || "NÃO INFORMADA")
    .replace("{link}", linkWhatsapp);

  // ✅ validação: sem acentos ou caracteres especiais
  const regexPermitido = /^[A-Za-z0-9 .,:\-_\/]+$/;
  if (!regexPermitido.test(mensagemFinal)) {
    alert("A mensagem nao pode conter acentos ou caracteres especiais.");
    return;
  }

  // ✅ VALIDAÇÃO DE 160 CARACTERES
  if (mensagemFinal.length > 160) {
    alert(`Mensagem muito longa (${mensagemFinal.length} caracteres). Máximo permitido: 160.`);
    return;
  }

  enviando = true;
  setLoading(true);

  try {
    const res = await fetch("https://sms-backend-1278.onrender.com/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensagem: mensagemFinal,
        numeros: [numeros[0]],
        senha: senhaInput.value.trim()
      })
    });

    const data = await res.json();
    console.log(`Número: ${numeros[0]}`, data);

    if (res.ok) {
      alert("Envio realizado com sucesso!");
      numeros = [];
      lista.value = "";
    } else {
      alert("Erro no envio.");
    }

  } catch (err) {
    console.error("Erro ao enviar:", err);
    alert("Erro ao enviar.");
  } finally {
    setLoading(false);
  }
});


// ---------- Funções auxiliares ----------
function aplicarMascara(input) {
  let valor = input.value.replace(/\D/g, "");

  if (valor.length > 11) valor = valor.substring(0, 11);

  if (valor.length > 6) {
    input.value = `(${valor.substring(0,2)}) ${valor.substring(2,7)}-${valor.substring(7)}`;
  } else if (valor.length > 2) {
    input.value = `(${valor.substring(0,2)}) ${valor.substring(2)}`;
  } else if (valor.length > 0) {
    input.value = `(${valor}`;
  }
}

function atualizarPreview() {
  let msg = selectMensagem.value;
  let whatsapp = whatsappInput.value.replace(/\D/g, "").trim();
  let vaga = vagaInput.value.trim() || "NÃO INFORMADA";

  if (whatsapp.length === 11) whatsapp = "55" + whatsapp;

  let whatsappFormatado = whatsapp ? formatarNumero(whatsapp) : "SEU_WHATSAPP";
  let linkWhatsapp = whatsapp ? `https://wa.me/${whatsapp}` : "LINK_WHATSAPP";

  let textoFinal = msg
    ? msg
        .replace("{whatsapp}", whatsappFormatado)
        .replace("{vaga}", vaga)
        .replace("{link}", linkWhatsapp)
    : "";

  preview.textContent = textoFinal;
}

function adicionarNumero() {
  if (numeros.length >= 1) {
    alert("Só é permitido enviar para um número por vez.");
    return;
  }

  let numero = inputNumero.value.replace(/\D/g, "").trim();

  if (!numero.startsWith("55")) numero = "55" + numero;

  if (!validarNumero(numero)) {
    alert("Número inválido.");
    return;
  }

  numeros.push(numero);
  atualizarLista();
  inputNumero.value = "";
}

function validarNumero(numero) {
  let n = numero.replace(/^55/, "");
  return n.length === 10 || n.length === 11;
}

function atualizarLista() {
  const formatados = numeros.map(formatarNumero);
  lista.value = formatados.join("; ");
}

function formatarNumero(numero) {
  let n = numero.replace(/^55/, "");
  let ddd = n.substring(0, 2);

  if (n.length === 11) {
    return `(${ddd}) ${n.substring(2,7)}-${n.substring(7,11)}`;
  } else {
    return `(${ddd}) ${n.substring(2,6)}-${n.substring(6,10)}`;
  }
}
