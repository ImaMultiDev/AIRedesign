"use client";

import Image from "next/image";
import {
  useCallback,
  useId,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { cn } from "@/lib/utils";
import { parseSortPriceNumberOnly } from "@/lib/parse-sort-price";
import {
  RETAILER_BRAND_IDS,
  RETAILER_BRAND_LABELS,
  type RetailerBrandId,
} from "@/lib/retailer-brands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crosshair, Plus, Trash2 } from "lucide-react";

export type ShopTheLookDraftOffer = {
  clientId: string;
  storeName: string;
  storeBrand: RetailerBrandId;
  /** URL de imagen del producto en la tienda (opcional) */
  thumbnailUrl: string;
  priceLabel: string;
  /** Número para ordenar (menor = mejor); si vacío se infiere del texto de precio */
  sortPrice: string;
  buyUrl: string;
};

export type ShopTheLookDraftPin = {
  clientId: string;
  positionX: number;
  positionY: number;
  name: string;
  offers: ShopTheLookDraftOffer[];
};

function newClientId(prefix: string) {
  return `${prefix}-${crypto.randomUUID?.() ?? Date.now()}`;
}

export function emptyOffer(): ShopTheLookDraftOffer {
  return {
    clientId: newClientId("off"),
    storeName: "",
    storeBrand: "other",
    thumbnailUrl: "",
    priceLabel: "",
    sortPrice: "",
    buyUrl: "",
  };
}

function buyUrlOk(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function serializePinsForApi(
  pins: ShopTheLookDraftPin[],
):
  | { ok: true; payload: Record<string, unknown>[] }
  | { ok: false; message: string } {
  if (pins.length === 0) return { ok: true, payload: [] };
  for (let i = 0; i < pins.length; i++) {
    const p = pins[i];
    if (!p.name.trim()) {
      return {
        ok: false,
        message: `El punto ${i + 1} no tiene nombre del producto. Abre cada punto en la lista lateral y comprueba el campo «Nombre del mueble / objeto».`,
      };
    }
    if (p.offers.length === 0) {
      return {
        ok: false,
        message: `Añade al menos una tienda para «${p.name.trim().slice(0, 40)}».`,
      };
    }
    for (const o of p.offers) {
      if (!o.storeName.trim()) {
        return {
          ok: false,
          message: "Indica el nombre de la tienda en cada oferta.",
        };
      }
      if (!o.buyUrl.trim() || !buyUrlOk(o.buyUrl)) {
        return {
          ok: false,
          message: `Enlace no válido (${o.storeName.trim()}). Usa https://…`,
        };
      }
      const thumb = o.thumbnailUrl.trim();
      if (thumb && !buyUrlOk(thumb)) {
        return {
          ok: false,
          message: `URL de miniatura no válida (${o.storeName.trim()}).`,
        };
      }
      const sortNum = parseSortPriceNumberOnly(
        o.priceLabel,
        o.sortPrice.trim() !== "" ? o.sortPrice : undefined,
      );
      if (!Number.isFinite(sortNum) || sortNum === Number.POSITIVE_INFINITY) {
        return {
          ok: false,
          message: `Precio no reconocido para ${o.storeName.trim()}. Usa un número o texto tipo «899 €».`,
        };
      }
    }
  }
  return {
    ok: true,
    payload: pins.map((p) => ({
      positionX: p.positionX,
      positionY: p.positionY,
      name: p.name.trim(),
      offers: p.offers.map((o) => {
        const sortPrice = parseSortPriceNumberOnly(
          o.priceLabel,
          o.sortPrice.trim() !== "" ? o.sortPrice : undefined,
        );
        const priceLabel =
          o.priceLabel.trim() ||
          `${sortPrice.toLocaleString("es-ES", { maximumFractionDigits: 2 })} €`;
        return {
          storeName: o.storeName.trim(),
          storeBrand: o.storeBrand,
          thumbnailUrl: o.thumbnailUrl.trim() || null,
          buyUrl: o.buyUrl.trim().slice(0, 2048),
          priceLabel: priceLabel.slice(0, 120),
          sortPrice,
        };
      }),
    })),
  };
}

type Props = {
  imageUrl: string;
  pins: ShopTheLookDraftPin[];
  /** Preferible usar el setter de useState (acepta actualizaciones funcionales). */
  onChange: Dispatch<SetStateAction<ShopTheLookDraftPin[]>>;
  disabled?: boolean;
};

export function ShopTheLookEditor({
  imageUrl,
  pins,
  onChange,
  disabled,
}: Props) {
  const baseId = useId();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const updatePin = useCallback(
    (clientId: string, patch: Partial<ShopTheLookDraftPin>) => {
      onChange((prev) =>
        prev.map((p) => (p.clientId === clientId ? { ...p, ...patch } : p)),
      );
    },
    [onChange],
  );

  const updateOffer = useCallback(
    (
      pinId: string,
      offerId: string,
      patch: Partial<ShopTheLookDraftOffer>,
    ) => {
      onChange((prev) =>
        prev.map((p) => {
          if (p.clientId !== pinId) return p;
          return {
            ...p,
            offers: p.offers.map((o) =>
              o.clientId === offerId ? { ...o, ...patch } : o,
            ),
          };
        }),
      );
    },
    [onChange],
  );

  const addOffer = useCallback(
    (pinId: string) => {
      onChange((prev) =>
        prev.map((p) =>
          p.clientId === pinId
            ? { ...p, offers: [...p.offers, emptyOffer()] }
            : p,
        ),
      );
    },
    [onChange],
  );

  const removeOffer = useCallback(
    (pinId: string, offerId: string) => {
      onChange((prev) =>
        prev.map((p) => {
          if (p.clientId !== pinId) return p;
          const next = p.offers.filter((o) => o.clientId !== offerId);
          return { ...p, offers: next.length ? next : [emptyOffer()] };
        }),
      );
    },
    [onChange],
  );

  const removePin = useCallback(
    (clientId: string) => {
      onChange((prev) => prev.filter((p) => p.clientId !== clientId));
      setSelectedId((cur) => (cur === clientId ? null : cur));
    },
    [onChange],
  );

  const addPinAtFraction = useCallback(
    (nx: number, ny: number) => {
      if (disabled) return;
      const clientId = newClientId("pin");
      onChange((prev) => [
        ...prev,
        {
          clientId,
          positionX: Math.min(1, Math.max(0, nx)),
          positionY: Math.min(1, Math.max(0, ny)),
          name: "",
          offers: [emptyOffer()],
        },
      ]);
      setSelectedId(clientId);
    },
    [disabled, onChange],
  );

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    if ((e.target as HTMLElement).closest("[data-admin-pin-marker]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    addPinAtFraction(x, y);
  }

  function handleBackdropKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    addPinAtFraction(0.5, 0.5);
  }

  const selected = pins.find((p) => p.clientId === selectedId) ?? null;

  return (
    <div className="grid gap-5 rounded-2xl border border-foreground/10 bg-gradient-to-b from-muted/30 to-background/80 p-4 shadow-inner sm:grid-cols-[1fr_min(300px,40%)] sm:gap-6 sm:p-5">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-primary">
              Shop the Look · comparador
            </Label>
            <p className="text-xs text-muted-foreground">
              Clic en la imagen «después» para colocar un punto. Por producto,
              añade 2–3 tiendas con precio y enlace; el cliente Plus verá la
              mejor oferta destacada.
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-foreground/10 bg-background/80 px-2.5 py-1 text-[10px] text-muted-foreground">
            <Crosshair className="size-3.5 text-primary" aria-hidden />
            <span>{pins.length} producto{pins.length === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label="Clic en la imagen para colocar un punto de producto"
          onClick={handleBackdropClick}
          onKeyDown={handleBackdropKeyDown}
          className={cn(
            "relative block w-full overflow-hidden rounded-xl bg-muted ring-1 ring-inset ring-foreground/10 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
            disabled
              ? "cursor-not-allowed opacity-60 pointer-events-none"
              : "cursor-crosshair",
          )}
        >
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={imageUrl}
              alt="Marcar productos en la propuesta"
              fill
              className="object-cover"
              sizes="(max-width:640px) 100vw, 480px"
              unoptimized={
                imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")
              }
            />
            {pins.map((p, i) => (
              <button
                key={p.clientId}
                type="button"
                data-admin-pin-marker
                disabled={disabled}
                onClick={(ev) => {
                  ev.stopPropagation();
                  setSelectedId(p.clientId);
                }}
                className={cn(
                  "absolute z-[2] flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-semibold shadow-sm transition-transform hover:scale-105",
                  selectedId === p.clientId
                    ? "scale-110 border-primary bg-primary text-primary-foreground"
                    : "border-white/90 bg-white/90 text-foreground backdrop-blur-sm",
                )}
                style={{
                  left: `${p.positionX * 100}%`,
                  top: `${p.positionY * 100}%`,
                }}
                aria-label={`Producto ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Detalle del punto
        </Label>
        <div className="max-h-[220px] overflow-y-auto rounded-lg border border-foreground/10 bg-background/50 sm:max-h-[280px]">
          <ul className="space-y-2 p-2">
            {pins.length === 0 ? (
              <li className="px-2 py-6 text-center text-xs text-muted-foreground">
                Aún no hay puntos. Haz clic en la imagen para el primero.
              </li>
            ) : (
              pins.map((p, i) => (
                <li key={p.clientId}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedId(p.clientId)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-colors",
                      selectedId === p.clientId
                        ? "border-primary/40 bg-primary/10"
                        : "border-transparent bg-muted/40 hover:bg-muted/70",
                    )}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-bold shadow-sm">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {p.name.trim() || "Sin nombre"}{" "}
                      <span className="text-muted-foreground">
                        · {p.offers.length} tienda
                        {p.offers.length === 1 ? "" : "s"}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {selected ? (
          <div className="space-y-4 rounded-xl border border-foreground/10 bg-background p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-foreground">
                Producto en el punto
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-destructive hover:text-destructive"
                disabled={disabled}
                onClick={() => removePin(selected.clientId)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${baseId}-name`} className="text-[11px]">
                Nombre del mueble / objeto
              </Label>
              <Input
                id={`${baseId}-name`}
                value={selected.name}
                onChange={(e) =>
                  updatePin(selected.clientId, { name: e.target.value })
                }
                disabled={disabled}
                className="h-9 rounded-lg text-sm"
                placeholder="Sofá modular, lámpara…"
              />
            </div>

            <div className="space-y-2 border-t border-foreground/10 pt-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-[11px] font-medium">
                  Tiendas y precios
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 rounded-lg text-xs"
                  disabled={disabled}
                  onClick={() => addOffer(selected.clientId)}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Añadir tienda
                </Button>
              </div>
              <p className="text-[10px] leading-snug text-muted-foreground">
                Rellena precio mostrado y/o número para ordenar. El listado
                público se ordena de más barato a más caro.
              </p>
              <ul className="space-y-3">
                {selected.offers.map((o, oi) => (
                  <li
                    key={o.clientId}
                    className="space-y-2 rounded-lg border border-foreground/10 bg-muted/20 p-2.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Oferta {oi + 1}
                      </span>
                      {selected.offers.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive"
                          disabled={disabled}
                          onClick={() =>
                            removeOffer(selected.clientId, o.clientId)
                          }
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-muted-foreground">
                          Marca (icono)
                        </label>
                        <select
                          value={o.storeBrand}
                          disabled={disabled}
                          onChange={(e) =>
                            updateOffer(selected.clientId, o.clientId, {
                              storeBrand: e.target.value as RetailerBrandId,
                            })
                          }
                          className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {RETAILER_BRAND_IDS.map((id) => (
                            <option key={id} value={id}>
                              {RETAILER_BRAND_LABELS[id]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] font-medium text-muted-foreground">
                          Nombre tienda (texto)
                        </label>
                        <Input
                          value={o.storeName}
                          onChange={(e) =>
                            updateOffer(selected.clientId, o.clientId, {
                              storeName: e.target.value,
                            })
                          }
                          disabled={disabled}
                          className="h-8 rounded-md text-sm"
                          placeholder="Amazon, IKEA…"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Miniatura del producto (URL imagen)
                      </label>
                      <Input
                        value={o.thumbnailUrl}
                        onChange={(e) =>
                          updateOffer(selected.clientId, o.clientId, {
                            thumbnailUrl: e.target.value,
                          })
                        }
                        disabled={disabled}
                        className="h-8 rounded-md text-xs"
                        placeholder="https://… (foto del artículo en la tienda)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={o.priceLabel}
                        onChange={(e) =>
                          updateOffer(selected.clientId, o.clientId, {
                            priceLabel: e.target.value,
                          })
                        }
                        disabled={disabled}
                        className="h-8 rounded-md text-sm"
                        placeholder="899 € · texto"
                      />
                      <Input
                        inputMode="decimal"
                        value={o.sortPrice}
                        onChange={(e) =>
                          updateOffer(selected.clientId, o.clientId, {
                            sortPrice: e.target.value,
                          })
                        }
                        disabled={disabled}
                        className="h-8 rounded-md text-sm"
                        placeholder="Nº orden"
                      />
                    </div>
                    <Input
                      value={o.buyUrl}
                      onChange={(e) =>
                        updateOffer(selected.clientId, o.clientId, {
                          buyUrl: e.target.value,
                        })
                      }
                      disabled={disabled}
                      className="h-8 rounded-md text-xs"
                      placeholder="https://…"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
