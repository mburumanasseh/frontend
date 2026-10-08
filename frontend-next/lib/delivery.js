import { deliveryZones, defaultDeliveryFee } from '../data/deliveryZones'

export default function calculateDeliveryFee(location) {
  const normalizedLocation = (location || '').trim().toLowerCase()
  if (!normalizedLocation) return 0
  const zone = deliveryZones.find((deliveryZone) =>
    deliveryZone.locations.some(
      (item) =>
        normalizedLocation.includes(item) || item.includes(normalizedLocation),
    ),
  )
  return zone ? zone.fee : defaultDeliveryFee
}
