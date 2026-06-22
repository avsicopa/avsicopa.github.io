import React from "react";

const stores = [
  {
    title: "Loja 1 Palmas-TO (Matriz e Loja 5 Distribuidora META)",
    name: "Auto Vidros Santa Izabel / Razão social: Marques & Marques Ltda",
    cnpj: "07.393.011/0001‑28",
    phone: "06332152620",
    phoneDisplay: "063 3215-2620",
    email: "sac@avsi.com.br",
    cnpjExtra: "07.393.011/0005-51 (Loja 5 Meta Palmas-TO, mesmo endereço da Matriz)",
    address:
      "Quadra 201 Sul, Av. Joaquim Teotônio Segurado, 171, Lote 8 – Plano Diretor Sul, Palmas – TO, 77015-200",
    map: "https://maps.app.goo.gl/etBQSd4NYumVc2zX6",
  },
  {
    title: "Loja 2 Taquaralto (Palmas)",
    cnpj: "07.393.011/0002-09",
    phone: "06335711110",
    phoneDisplay: "063 3571-1110",
    email: "taquaralto@avsi.com.br",
    address:
      "Avenida Palmas, Quadra 05, Lote 01 – Setor Santa Fé, Taquaralto, Palmas – TO, 77064-070",
    map: "https://maps.app.goo.gl/sexUdKFKjhFiSCGZA",
  },
  {
    title: "Loja 3 Araguaína-TO",
    cnpj: "07.393.011/0003-90",
    phone: "06334156700",
    phoneDisplay: "063 3415-6700",
    email: "araguaina@avsi.com.br",
    address: "Av. Cônego João Lima, 1158 – Vila Rosário, Araguaína – TO, 77804-010",
    map: "https://maps.app.goo.gl/HqsAD8UK845XactB8",
  },
  {
    title: "Loja 4 Paraíso-TO",
    cnpj: "07.393.011/0004-70",
    phone: "06336021050",
    phoneDisplay: "063 3602-1050",
    email: "paraiso@avsi.com.br",
    address:
      "Av. Transbrasiliana, 1223 – SALA-A – Setor INTERLAGOS, Paraíso do Tocantins – TO, 77600-000",
    map: "https://maps.app.goo.gl/BqdmAVceb2xGVk1x7",
  },
  {
    title: "Loja 6 Gurupi-TO",
    cnpj: "07.393.011/0006-32",
    phone: "06333121130",
    phoneDisplay: "063 3312-1130",
    email: "gurupi@avsi.com.br",
    address: "Av. Goiás, 2696 – St. Central, Gurupi – TO, 77410-010",
    map: "https://maps.app.goo.gl/mh2QJYx3EXY4o9Ur9",
  },
];

function ContactSection({ show, onClose }) {
  if (!show) return null;

  return (
    <div
      id="contact-section"
      className="contact-section active"
      onClick={onClose}
    >
      <div className="contact-content" onClick={(e) => e.stopPropagation()}>
        <button id="close-contact" className="close-btn" onClick={onClose}>
          &times;
        </button>

        <h2 className="contact-title">
          📞 Fale Conosco - <span className="highlight">AVSI 35 Anos</span>
        </h2>

        {stores.map((store) => (
          <div className="store-card" key={store.title}>
            <h3 className="store-name">
              <strong>{store.title}</strong>
            </h3>

            {store.name && (
              <p>
                <strong>Nome:</strong> {store.name}
              </p>
            )}

            <p>
              <strong>CNPJ:</strong> {store.cnpj}{" "}
              <span className="phone-icon">📞</span>
              <a href={`tel:${store.phone}`} className="contact-link">
                {store.phoneDisplay}
              </a>{" "}
              <a href={`mailto:${store.email}`} className="contact-link">
                📧
              </a>
            </p>

            {store.cnpjExtra && (
              <p>
                <strong>CNPJ Extra:</strong> {store.cnpjExtra}
              </p>
            )}

            <p>
              <strong>Endereço:</strong> {store.address}
            </p>

            <p>
              <span className="map-icon">🚩</span>{" "}
              <a
                href={store.map}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
                style={{ textDecoration: "underline" }}
              >
                Link da Localização
              </a>
            </p>
          </div>
        ))}

        <div className="about-us-card">
          <h3 className="store-name">
            <strong>
              Nosso Grupo AVSI (Auto Vidros Santa Izabel) está no Mercado a 35 Anos!
            </strong>
          </h3>

          <ul>
            <li>
              Fundada em <strong>1991</strong>, em Gurupi (TO) –{" "}
              <strong>35 anos</strong> de atuação no mercado de tintas, vidros
              automotivos e acessórios!
            </li>
            <li>
              Principais Parceiros:{" "}
              <strong>
                SekuritPartner, Anjo Tintas, Axalta Duxone, Indasa, Profissional
                Tintas, Maxi Rubber, Valeo e muitas outras...
              </strong>
            </li>
            <li>
              Representantes autorizados de vidros SekuritPartner; uso de vidros
              originais homologados!
            </li>
            <li>
              Produtos: Vidros automotivos, Tintas personalizadas (automotivas,
              metal, pvc, madeira), acessórios de pintura
            </li>
            <li>
              Serviços: Instalação/remoção de vidros, polimento de faróis,
              cristalização de para-brisa, reparo de para-brisa, gravação de
              chassis, manutenção de teto solar
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ContactSection;