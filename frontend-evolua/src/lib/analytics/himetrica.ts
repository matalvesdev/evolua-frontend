"use client"

import { HimetricaClient } from "@himetrica/tracker-js"

let himetrica: HimetricaClient | null = null

export function getHimetrica(): HimetricaClient {
  if (!himetrica) {
    himetrica = new HimetricaClient({
      apiKey: "hm_ff13dddce2ecea79562d16c8d56c9545e20aa4deefa79df0",
      trackVitals: true,
      autoTrackErrors: true,
    })
  }
  return himetrica
}
