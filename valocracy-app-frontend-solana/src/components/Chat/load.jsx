import React, { useState } from 'react';

const AnimatedDiv = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar a visibilidade da div

  return (
    <div>
      {/* Botão para abrir a div */}
      {!isOpen && (
        <button className="open-btn" onClick={() => setIsOpen(true)}>
          Abrir
        </button>
      )}

      {/* A div animada */}
      <div className={`animated-div ${isOpen ? 'open' : 'closed'}`}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default AnimatedDiv;