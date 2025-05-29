"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle } from "lucide-react"

export function ProtocolComparisonTable() {
    return (
        <div className="w-full overflow-auto">
            <Table>
                <TableCaption>Comparación entre OIDC y SAML 2.0</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Característica</TableHead>
                        <TableHead>OpenID Connect (OIDC)</TableHead>
                        <TableHead>SAML 2.0</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">Formato</TableCell>
                        <TableCell>JSON/JWT</TableCell>
                        <TableCell>XML</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Basado en</TableCell>
                        <TableCell>OAuth 2.0</TableCell>
                        <TableCell>XML/SOAP</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Año de creación</TableCell>
                        <TableCell>2014</TableCell>
                        <TableCell>2005</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Complejidad</TableCell>
                        <TableCell className="text-green-600">Baja</TableCell>
                        <TableCell className="text-amber-600">Alta</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Tamaño del token</TableCell>
                        <TableCell className="text-green-600">Pequeño</TableCell>
                        <TableCell className="text-amber-600">Grande</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Ideal para SPAs</TableCell>
                        <TableCell>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </TableCell>
                        <TableCell>
                            <XCircle className="h-5 w-5 text-red-500" />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Ideal para móviles</TableCell>
                        <TableCell>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </TableCell>
                        <TableCell>
                            <XCircle className="h-5 w-5 text-red-500" />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Compatible con legacy</TableCell>
                        <TableCell>
                            <XCircle className="h-5 w-5 text-red-500" />
                        </TableCell>
                        <TableCell>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Adopción enterprise</TableCell>
                        <TableCell>Creciente</TableCell>
                        <TableCell>Establecida</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Soporte en Okta</TableCell>
                        <TableCell>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </TableCell>
                        <TableCell>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}
