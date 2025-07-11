import { Button } from "@/components/ui/button";
import { Phone, MapPin, Clock, Star, Truck, Shield } from "lucide-react";
import Image from "next/image";
import ProdutosSection from "@/components/produtos-section";
import ScrollToTop from "@/components/scroll-to-top";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Adicionado padding-top para compensar o header fixo */}
      <section
        id="inicio"
        className="bg-gradient-to-r from-blue-50 to-blue-100 py-20 pt-32"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Congelados de <span className="text-blue-600">Qualidade</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Texto chamativo até 100 caracteres.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href="#produtos" className="flex items-center">
                    Faça seu pedido
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative self-center md:self-start">
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Produtos congelados"
                width={500}
                height={400}
                className="rounded-lg shadow-xl w-full md:w-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {/*Logo */}
              </div>
              <h3 className="text-xl font-semibold mb-2">Sempre Frescos</h3>
              <p className="text-gray-600">
                Produtos congelados no ponto certo, mantendo todo o sabor e
                qualidade
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">
                Entregamos em toda a região com agilidade e cuidado especial
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Qualidade Garantida
              </h3>
              <p className="text-gray-600">
                Ingredientes selecionados e processo artesanal para máxima
                qualidade
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos */}
      <ProdutosSection />

      {/* Sobre */}
      <section id="sobre" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Nossa cozinha"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Sobre a FreezeFood
              </h2>
              <p className="text-gray-600 mb-6">
                Há mais de 10 anos no mercado, a FreezeFood nasceu do sonho de
                levar sabor caseiro para a mesa das famílias com toda a
                praticidade dos produtos congelados.
              </p>
              <p className="text-gray-600 mb-6">
                Nossos produtos são preparados diariamente com ingredientes
                frescos e selecionados, seguindo receitas tradicionais que
                conquistaram o paladar de milhares de clientes.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
                <span className="text-gray-600">
                  +1000 clientes satisfeitos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Entre em Contato
            </h2>
            <p className="text-xl text-blue-100">
              Faça seu pedido ou tire suas dúvidas conosco
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Telefone</h3>
              <p className="text-blue-100">(13) 99999-9999</p>
              <p className="text-blue-100">(13) 3333-3333</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Endereço</h3>
              <p className="text-blue-100">Rua das Flores, 123</p>
              <p className="text-blue-100">Centro - Mongaguá/SP</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Horário</h3>
              <p className="text-blue-100">Segunda a Sexta: 8h às 18h</p>
              <p className="text-blue-100">Sábado: 8h às 14h</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="secondary">
              <Phone className="h-4 w-4 mr-2" />
              Fazer Pedido Agora
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
