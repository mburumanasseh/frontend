const deliveryZones = [
  {
    name: 'Nairobi',
    fee: 200,
    locations: [
      'nairobi',
      'westlands',
      'cbd',
      'kilimani',
      'kasarani',
      'langata',
      'embakasi',
    ],
  },
  {
    name: 'Kiambu',
    fee: 300,
    locations: [
      'kiambu',
      'thika',
      'ruiru',
      'limuru',
      'kikuyu',
    ],
  },
  {
    name: 'Machakos',
    fee: 350,
    locations: [
      'machakos',
      'athi river',
      'mavoko',
    ],
  },
]

const defaultDeliveryFee = 500

export { deliveryZones, defaultDeliveryFee }