// Lista dos "user agents" que os robôs de prévia de link usam.
// Quando um desses acessa /imovel/:id, devolvemos HTML pronto com as meta tags —
// eles não executam JavaScript, então não veem o que o React monta na tela.
const PADRAO_ROBOS = /facebookexternalhit|WhatsApp|Twitterbot|Slackbot|TelegramBot|LinkedInBot|Discordbot|Pinterest|redditbot|SkypeUriPreview/i;

export function ehRoboDePreVia(userAgent = '') {
  return PADRAO_ROBOS.test(userAgent);
}
