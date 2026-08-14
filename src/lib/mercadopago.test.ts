import { describe, expect, it } from "vitest";

import { mapMpStatusToPaymentStatus } from "@/lib/mercadopago";

describe("mapMpStatusToPaymentStatus", () => {
  it("approved → APPROVED", () => {
    expect(mapMpStatusToPaymentStatus("approved")).toBe("APPROVED");
  });

  it("pending → PENDING", () => {
    expect(mapMpStatusToPaymentStatus("pending")).toBe("PENDING");
  });

  it("authorized / in_process / in_mediation → IN_PROCESS", () => {
    expect(mapMpStatusToPaymentStatus("authorized")).toBe("IN_PROCESS");
    expect(mapMpStatusToPaymentStatus("in_process")).toBe("IN_PROCESS");
    expect(mapMpStatusToPaymentStatus("in_mediation")).toBe("IN_PROCESS");
  });

  it("rejected → REJECTED", () => {
    expect(mapMpStatusToPaymentStatus("rejected")).toBe("REJECTED");
  });

  it("cancelled → CANCELLED", () => {
    expect(mapMpStatusToPaymentStatus("cancelled")).toBe("CANCELLED");
  });

  it("refunded / charged_back → REFUNDED", () => {
    expect(mapMpStatusToPaymentStatus("refunded")).toBe("REFUNDED");
    expect(mapMpStatusToPaymentStatus("charged_back")).toBe("REFUNDED");
  });

  it("un status desconocido cae a PENDING (nunca confirma un pago por error)", () => {
    expect(mapMpStatusToPaymentStatus("algo-nuevo-que-invento-mp")).toBe("PENDING");
  });
});
