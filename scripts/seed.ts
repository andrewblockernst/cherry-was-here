import { seedCountries } from '../server/db/seed'
import { useDb } from '../server/utils/db'

await seedCountries(useDb())
console.log('countries seeded')
