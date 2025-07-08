import React from "react";

type Props = {};

function footer({}: Props) {
  return (
    <footer className="bg-gray-800 text-white py-8 max-[640px]:pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between sm:justify-start">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="w-[200px] text-xl font-bold">Pampa Congelados</span>
          </div>
          <p className="text-gray-400 text-center w-full">
            &copy; {new Date().getFullYear()} Pampa Congelados. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default footer;
