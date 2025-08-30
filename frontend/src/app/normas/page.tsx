"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function NormasPage() {
  const [normas, setNormas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNormas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status && { status })
      });

      const res = await fetch(`/api/normas?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setNormas(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Erro ao buscar normas:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNormas();
  }, [page, search, status]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (newStatus) => {
    setStatus(newStatus === status ? "" : newStatus);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Normas Regulamentadoras</h1>
          <p className="text-muted-foreground mt-2">Explore e pesquise todas as normas disponíveis</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por código ou título..."
                  value={search}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={status === "ativa" ? "default" : "outline"}
                  onClick={() => handleStatusFilter("ativa")}
                >
                  Ativas
                </Button>
                <Button
                  variant={status === "revogada" ? "default" : "outline"}
                  onClick={() => handleStatusFilter("revogada")}
                >
                  Revogadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Normas */}
        {loading ? (
          <div className="text-center py-8">Carregando normas...</div>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {normas.map((norma) => (
                <Card key={norma.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{norma.codigo}</h3>
                        <p className="text-muted-foreground mt-1">{norma.titulo}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary">{norma.orgao_publicador}</Badge>
                          {norma.titulo.includes("REVOGADA") ? (
                            <Badge variant="destructive">Revogada</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-600">Ativa</Badge>
                          )}
                        </div>
                      </div>
                      <Link href={`/normas/${norma.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
