import { expect, test } from "bun:test"
import "bun-match-svg"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { EasyEdaJsonSchema, convertEasyEdaJsonToCircuitJson } from "lib/index"
import rawJson from "tests/assets/C75749.raweasy.json"

test("preserves the side of bottom-layer silkscreen text", () => {
  const rawWithBottomLayerText = structuredClone(rawJson)
  rawWithBottomLayerText.packageDetail.dataStr.shape =
    rawWithBottomLayerText.packageDetail.dataStr.shape.map((shape) =>
      shape.startsWith("TEXT~") ? shape.replace("~0~3~", "~0~4~") : shape,
    )

  const circuitJson = convertEasyEdaJsonToCircuitJson(
    EasyEdaJsonSchema.parse(rawWithBottomLayerText),
  )
  const textElements = circuitJson.filter(
    (
      element,
    ): element is Extract<AnyCircuitElement, { type: "pcb_silkscreen_text" }> =>
      element.type === "pcb_silkscreen_text",
  )

  expect(textElements.length).toBeGreaterThan(0)
  expect(textElements.every((text) => text.layer === "bottom")).toBe(true)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
  )
})
