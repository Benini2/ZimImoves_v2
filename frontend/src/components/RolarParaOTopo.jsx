import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Quando a pessoa abre uma página nova (ex: clica num card), o navegador mantinha a rolagem
// da página anterior — no celular o imóvel abria "no meio". Aqui forçamos voltar ao topo.
// Não faz nada quando a pessoa usa o "voltar" do navegador (aí ela quer a posição de antes).
// Só reage à troca de página, não a mudanças de filtro (?tipo=...) na mesma página.
export default function RolarParaOTopo() {
  const { pathname } = useLocation();
  const tipoNavegacao = useNavigationType();

  useEffect(() => {
    if (tipoNavegacao !== 'POP') window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
