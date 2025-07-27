// core/constants.js

const allowedTables = [
  'Acura', 'AlfaRomeo', 'AstonMartin', 'Audi', 'Bentley', 'BMW', 'Bugatti',
  'Buick', 'Cadillac', 'Canoo', 'Chevrolet', 'Chrysler', 'DeLorean', 'Dodge',
  'Ferrari', 'Fiat', 'Fisker', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hummer',
  'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Karma', 'Kia', 'Lamborghini',
  'LandRover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Maybach', 'Mazda',
  'McLaren', 'Mercedes', 'Mercury', 'Mini', 'Mitsubishi', 'Nissan',
  'Oldsmobile', 'Polestar', 'Pontiac', 'Porsche', 'Plymouth', 'Ram', 'Rivian',
  'RollsRoyce', 'Saab', 'Saturn', 'Scion', 'Smart', 'Subaru', 'Suzuki', 'Tesla',
  'Toyota', 'Volkswagen', 'VinFast', 'Volvo', 'Vaz', 'Volga', 'Gaz', 'Gazel', 'Uaz'
];

const allowedServices = [
  'шиномонтаж', 'техническое_обслуживание', 'автозвук', 'чип_тюнинг',
  'ремонт_подвески', 'ремонт_генератора', 'кузовной_ремонт', 'ремонт_КПП',
  'диагностика', 'эвакуатор', 'ремонт_дисков'
];

const allowedLawyers = [
  'независимая_экспертиза', 'оценка_автомобиля', 'автоюрист', 'осаго', 'авайриные_комиссары'
];

const CARS_PER_PAGE = 10;
const SERVICES_PER_PAGE = 10;
const LAWYERS_PER_PAGE = 10;

module.exports = {
  allowedTables,
  allowedServices,
  allowedLawyers,
  CARS_PER_PAGE,
  SERVICES_PER_PAGE,
  LAWYERS_PER_PAGE,
};