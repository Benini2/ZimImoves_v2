import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Users } from 'lucide-react';

// TODO: trocar pelos dados reais da imobiliária
const CONTATO = {
  whatsapp: '554933534273',
  telefoneExibido: '(49) 3353-4273',
  email: 'contato@suaimobiliaria.com',
  endereco: 'Rua Rio Grande, 1282 — Centro, Xaxim - SC',
};

export default function Contato() {
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', mensagem: '' });

  function aoEnviar(e) {
    e.preventDefault();
    const texto = `Olá! Meu nome é ${form.nome}.\n${form.mensagem}\n\nContato: ${form.telefone || form.email}`;
    window.open(`https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
  }

  const campoStyle = { width: '100%' };
  const rotuloStyle = { fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' };

  return (
    <div style={{ background: 'var(--fundo)', borderTop: '1px solid var(--borda)' }}>
      <div className="container grid-duas-colunas" style={{ padding: '4rem 20px', gap: 48, alignItems: 'start' }}>
        <div>
          <span className="badge-eyebrow">Contatos</span>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, margin: '8px 0 0' }}>Vamos encontrar seu novo endereço</h1>
          <p style={{ fontSize: 15, color: 'var(--texto-secundario)', margin: '10px 0 0' }}>
            Entre em contato com um de nossos corretores. Atendimento rápido, personalizado e sem compromisso.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 32 }}>
            <ItemContato icone={Phone} label="Telefone" valor={CONTATO.telefoneExibido} />
            <ItemContato icone={Mail} label="E-mail" valor={CONTATO.email} />
            <ItemContato icone={MapPin} label="Endereço" valor={CONTATO.endereco} />
          </div>
          <a
            href="https://linkme.bio/zimimoveis?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAacDj6qSpLwW7peqHPs3_lvznnw3-sA5l48YOvC4hcxiqoNBPez636os6CsOMA_aem_6xU9zVqQvQ1sPVMYpwURvw"
            target="_blank"
            rel="noreferrer"
            className="btn-primario"
            style={{ width: '70%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
          >
            <Users size={16} /> Fale com um dos nossos corretores
          </a>
        </div>

        <form onSubmit={aoEnviar} style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 16, padding: '1.75rem', boxShadow: '0 1px 2px rgba(20,20,20,0.03)' }}>
          <div className="grid-2">
            <div>
              <label style={rotuloStyle}>Nome</label>
              <input style={campoStyle} placeholder="Seu nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label style={rotuloStyle}>Telefone</label>
              <input style={campoStyle} type="tel" placeholder="(00) 00000-0000" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={rotuloStyle}>E-mail</label>
            <input style={campoStyle} type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={rotuloStyle}>Mensagem</label>
            <textarea style={{ ...campoStyle, resize: 'vertical' }} rows={4} placeholder="Conte-nos qual imóvel você procura..." value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
          </div>
          <button type="submit" className="btn-primario" style={{ width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MessageCircle size={16} /> Enviar mensagem
          </button>
          <p style={{ fontSize: 11, color: 'var(--texto-secundario)', textAlign: 'center', marginTop: 10 }}>
            Sua mensagem abre direto no WhatsApp, pronta para enviar.
          </p>
        </form>
      </div>
    </div>
  );
}

function ItemContato({ icone: Icone, label, valor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FBEAE7', color: 'var(--cor-primaria)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icone size={19} />
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--texto-secundario)', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 16, fontWeight: 600, margin: '2px 0 0' }}>{valor}</p>
      </div>
    </div>
  );
}
