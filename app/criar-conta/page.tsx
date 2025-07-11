"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { EyeOff, Eye, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Components
import ModalSpinner from "@/components/criar-conta/ModalSpinner";

// Type
import { User_Model } from "@/models/User";

export default function Register() {
  const [email, setEmail] = useState<User_Model["email"]>("");
  const [password, setPassword] = useState<User_Model["password"]>("");
  const [confirmPassword, setConfirmPassword] =
    useState<User_Model["password"]>("");
  const [name, setName] = useState<User_Model["name"]>("");
  const [phone, setPhone] = useState<User_Model["phone"]>("");
  const [city, setCity] = useState<User_Model["city"]>("");
  const [neighborhood, setNeighborhood] =
    useState<User_Model["neighborhood"]>("");
  const [address, setAddress] = useState<User_Model["address"]>("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [sendingData, setSendingData] = useState(false);

  const router = useRouter();

  const { register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSendingData(true);

    if (!email || !password || !confirmPassword) {
      setErrorMsg("Por favor, preencha todos os campos");
      setSendingData(false);
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Por favor, insira um email válido");
      setSendingData(false);
      return;
    }

    // Validação de senha
    if (password.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres");
      setSendingData(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem");
      setSendingData(false);
      return;
    }

    const result = await register({
      email,
      password,
      name,
      phone,
      city,
      neighborhood,
      address,
      role: 1,
    });

    if (result.success) {
      setSuccessMsg(
        "Conta criada! Verifique seu e-mail para confirmar o cadastro."
      );
    } else {
      setErrorMsg(result.error || "Erro ao criar conta");
    }
    setSendingData(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-10 mt-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Pampa Congelados
          </h1>
          <p className="text-gray-600">Crie sua conta para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Nome */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700"
            >
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>

          {/* Campo Telefone */}
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700"
            >
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="51989998999"
              className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>

          {/* Campo Cidade */}
          <div className="space-y-2">
            <label
              htmlFor="city"
              className="block text-sm font-semibold text-gray-700"
            >
              Cidade
            </label>
            <input
              id="city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Gravataí"
              className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>

          {/* Campo Bairro */}
          <div className="space-y-2">
            <label
              htmlFor="neighborhood"
              className="block text-sm font-semibold text-gray-700"
            >
              Bairro
            </label>
            <input
              id="neighborhood"
              type="text"
              required
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex: Centro"
              className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>

          {/* Campo Endereço */}
          <div className="space-y-2">
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-gray-700"
            >
              Endereço
            </label>
            <input
              id="address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, complemento"
              className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>

          {/* Campo Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-md border border-gray-300 pl-10 pr-12 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Campo Confirmar Senha */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700"
            >
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                className="w-full rounded-md border border-gray-300 pl-10 pr-12 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errorMsg}</p>
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600">{successMsg}</p>
            </div>
          )}

          {/* Botão de Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3 transition-colors"
            disabled={loading}
          >
            Registrar
            {sendingData && (
              <ModalSpinner message="Enviando dados. Por favor, aguarde..." />
            )}
          </Button>
        </form>

        {/* Link para Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
