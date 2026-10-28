// Dados de contato usados no site inteiro: página de Contatos, rodapé e página do imóvel.
// Pra trocar telefone, e-mail, redes sociais ou corretores, é só mexer aqui.

export const CONTATO = {
  // WhatsApp principal da imobiliária: 55 + DDD + número, só dígitos
  whatsapp: '554933534273',
  telefoneExibido: '(49) 3353-4273',
  email: 'zimimoveis@gmail.com',
  endereco: 'Rua Rio Grande, 1282 — Centro, Xaxim - SC',
  creci: '5581J',
  // TODO: confirmar os links reais das redes sociais
  instagram: 'https://instagram.com/zimimoveis',
  facebook: 'https://facebook.com/zimimoveis',
};

// Botões de WhatsApp da página de Contatos, um por pessoa.
// TODO: preencher o "whatsapp" de cada corretor (55 + DDD + número, só dígitos).
// Enquanto estiver vazio, o botão abre a conversa da imobiliária já pedindo pra falar com aquela pessoa.
export const CORRETORES = [
  { nome: 'Imobiliária', whatsapp: CONTATO.whatsapp },
  { nome: 'Izelso Zim', whatsapp: '5549999050140' },
  { nome: 'Jacir Zim', whatsapp: '5549991356975' },
  { nome: 'Julio Grasel', whatsapp: '5549999285288' },
  { nome: 'Luciano Zilli', whatsapp: '5549999050116' },
  { nome: 'Nicole Zim', whatsapp: '5549998261515' },
];

export function linkWhatsapp(numero, mensagem) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
