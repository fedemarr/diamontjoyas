import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function ProductInfoAccordion({
  description,
  shippingRates,
}: {
  description: string | null;
  shippingRates: { amba?: number; interior?: number; retiroLocal?: number } | null;
}) {
  return (
    <Accordion type="single" collapsible defaultValue="descripcion" className="w-full">
      <AccordionItem value="descripcion">
        <AccordionTrigger>Descripción</AccordionTrigger>
        <AccordionContent>
          {description || "Sin descripción todavía."}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="envios">
        <AccordionTrigger>Envíos</AccordionTrigger>
        <AccordionContent>
          <ul className="flex flex-col gap-1">
            <li>Retiro sin cargo en San Miguel, Buenos Aires.</li>
            {shippingRates?.amba != null && <li>AMBA: costo calculado en el checkout.</li>}
            {shippingRates?.interior != null && <li>Interior del país: costo calculado en el checkout.</li>}
            <li>El costo final y el tiempo de entrega se confirman en el checkout, según tu código postal.</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="garantia">
        <AccordionTrigger>Garantía y cuidados</AccordionTrigger>
        <AccordionContent>
          Todas nuestras piezas tienen garantía por defectos de fabricación. Evitá el contacto con
          perfumes, cremas y agua para conservar el brillo. Guardá cada pieza por separado para
          que no se rayen entre sí.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
