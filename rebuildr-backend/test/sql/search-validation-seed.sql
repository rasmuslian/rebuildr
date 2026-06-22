BEGIN;

-- Reusable validation dataset for the new search flow.
-- Query ideas after seeding:
-- dörr, innerdörr, balkongdörr, karm, leksandsdörren
-- såg, fogsvans, bågfil, tigersåg, kapa metall, såga trä, rivning
-- isolering, mineralull, frigolit, isolera vind, dränera grund
-- skruvdragare, milwaukee, gipsskruv, fischer, montera gipsskivor
-- takfönster, dagsljus, vinylgolv, forbo, avloppsrör, spillvattenrör

DELETE FROM product WHERE title LIKE '%validation';
DELETE FROM category WHERE name LIKE 'Validering%';

INSERT INTO "user" (id, email, username, "emailVerifiedAt")
VALUES (
  '00000000-0000-0000-0000-000000000901',
  'search-validation@rebuildr.local',
  'search-validation',
  now()
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    username = EXCLUDED.username,
    "emailVerifiedAt" = EXCLUDED."emailVerifiedAt";

INSERT INTO category (id, name, description, "parentId", "searchAliases", measurements)
VALUES
  ('00000000-0000-0000-0000-000000000911', 'Validering byggdelar', 'Valideringskategori för byggdelar', null, ARRAY['byggdelar']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000912', 'Validering dörrar', 'Valideringskategori för dörrar', '00000000-0000-0000-0000-000000000911', ARRAY['dörr', 'dörrblad', 'byggdörr', 'snickeridörr']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000913', 'Validering verktyg', 'Valideringskategori för verktyg', null, ARRAY['verktyg', 'byggverktyg']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000914', 'Validering sågar', 'Valideringskategori för sågar', '00000000-0000-0000-0000-000000000913', ARRAY['såg', 'sågverktyg', 'kapverktyg', 'handsåg']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000915', 'Validering fönster', 'Valideringskategori för fönster', '00000000-0000-0000-0000-000000000911', ARRAY['fönster', 'glasparti', 'byggfönster']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000916', 'Validering isolering', 'Valideringskategori för isolering', '00000000-0000-0000-0000-000000000911', ARRAY['isolering', 'isolerskiva', 'mineralull', 'cellplast', 'frigolit']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000917', 'Validering skivmaterial', 'Valideringskategori för skivmaterial', '00000000-0000-0000-0000-000000000911', ARRAY['skiva', 'byggskiva', 'träskiva', 'skivmaterial']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000918', 'Validering golv', 'Valideringskategori för golv', '00000000-0000-0000-0000-000000000911', ARRAY['golv', 'golvbeläggning', 'ytgolv']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000919', 'Validering rör', 'Valideringskategori för rör', '00000000-0000-0000-0000-000000000911', ARRAY['rör', 'installationsrör', 'plaströr', 'rördel']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000920', 'Validering fästdon', 'Valideringskategori för fästdon', '00000000-0000-0000-0000-000000000911', ARRAY['skruv', 'fästdon', 'infästning', 'montageskruv']::text[], ARRAY[]::measurement_type_enum[]),
  ('00000000-0000-0000-0000-000000000924', 'Validering elverktyg', 'Valideringskategori för elverktyg', '00000000-0000-0000-0000-000000000913', ARRAY['elverktyg', 'maskinverktyg', 'batteriverktyg', 'elmaskin']::text[], ARRAY[]::measurement_type_enum[]);

INSERT INTO product (
  id,
  title,
  description,
  "categoryId",
  "sellerId",
  "brandId",
  price,
  status,
  "publishedAt",
  "pickupEnabled",
  "searchAliases",
  "searchRelatedTerms",
  "searchUseCases",
  "searchDocument"
)
VALUES
  ('00000000-0000-0000-0000-000000000921', 'Ytterdörr validation', 'Begagnad ytterdörr i trä för entré.', '00000000-0000-0000-0000-000000000912', '00000000-0000-0000-0000-000000000901', null, 100000, 'PUBLISHED', now(), true, ARRAY['dörr', 'ytterdörr', 'entrédörr']::text[], ARRAY['byggdel', 'entré']::text[], ARRAY[]::text[], 'ytterdörr validation begagnad ytterdörr i trä för entré validering dörrar validering byggdelar dörr ytterdörr innerdörr altandörr balkongdörr dörrkarm entrédörr byggdel entré'),
  ('00000000-0000-0000-0000-000000000922', 'Bågfil validation', 'Bågfil för metall och plast.', '00000000-0000-0000-0000-000000000914', '00000000-0000-0000-0000-000000000901', null, 8000, 'PUBLISHED', now(), true, ARRAY['bågfil', 'metallsåg']::text[], ARRAY['såg', 'handsåg', 'kapverktyg']::text[], ARRAY['kapa metall', 'såga metall']::text[], 'bågfil validation bågfil för metall och plast validering sågar validering verktyg såg handsåg metallsåg kapverktyg kapa metall såga metall'),
  ('00000000-0000-0000-0000-000000000923', 'Såg validation', 'Vanlig såg för trä.', '00000000-0000-0000-0000-000000000914', '00000000-0000-0000-0000-000000000901', null, 9000, 'PUBLISHED', now(), true, ARRAY['såg', 'handsåg']::text[], ARRAY['träverktyg']::text[], ARRAY['såga trä']::text[], 'såg validation vanlig såg för trä validering sågar validering verktyg såg handsåg träverktyg såga trä'),
  ('00000000-0000-0000-0000-000000000931', 'Innerdörr massiv validation', 'Massiv innerdörr i vitmålat trä för sovrum och kontor.', '00000000-0000-0000-0000-000000000912', '00000000-0000-0000-0000-000000000901', '3f72d6e8-cbf1-4e76-baff-434e141a042c', 45000, 'PUBLISHED', now(), true, ARRAY['innerdörr', 'spegeldörr']::text[], ARRAY['dörr', 'rumsdörr']::text[], ARRAY[]::text[], 'innerdörr massiv validation massiv innerdörr i vitmålat trä för sovrum och kontor validering dörrar validering byggdelar leksandsdörren dörr innerdörr altandörr balkongdörr dörrkarm spegeldörr rumsdörr'),
  ('00000000-0000-0000-0000-000000000932', 'Altandörr glasad validation', 'Glasad altandörr med mycket ljusinsläpp till uterum.', '00000000-0000-0000-0000-000000000912', '00000000-0000-0000-0000-000000000901', null, 62000, 'PUBLISHED', now(), true, ARRAY['altandörr', 'balkongdörr']::text[], ARRAY['dörr', 'glasdörr']::text[], ARRAY['släppa in ljus']::text[], 'altandörr glasad validation glasad altandörr med mycket ljusinsläpp till uterum validering dörrar validering byggdelar dörr ytterdörr innerdörr altandörr balkongdörr dörrkarm glasdörr släppa in ljus'),
  ('00000000-0000-0000-0000-000000000933', 'Dörrkarm furu validation', 'Komplett karm i furu för innerdörr.', '00000000-0000-0000-0000-000000000912', '00000000-0000-0000-0000-000000000901', null, 12000, 'PUBLISHED', now(), true, ARRAY['dörrkarm', 'karm']::text[], ARRAY['dörr', 'snickeri']::text[], ARRAY['montera innerdörr']::text[], 'dörrkarm furu validation komplett karm i furu för innerdörr validering dörrar validering byggdelar dörr dörrkarm karm snickeri montera innerdörr'),
  ('00000000-0000-0000-0000-000000000934', 'Takfönster 78x98 validation', 'Takfönster för snedtak som ger mer dagsljus på vinden.', '00000000-0000-0000-0000-000000000915', '00000000-0000-0000-0000-000000000901', null, 58000, 'PUBLISHED', now(), true, ARRAY['takfönster', 'takruta']::text[], ARRAY['fönster', 'vindfönster']::text[], ARRAY['släppa in dagsljus']::text[], 'takfönster 78x98 validation takfönster för snedtak som ger mer dagsljus på vinden validering fönster validering byggdelar fönster takfönster takruta vindfönster släppa in dagsljus'),
  ('00000000-0000-0000-0000-000000000935', 'Mineralullsskiva 95mm validation', 'Mineralullsskiva för vägg och vind med bra ljuddämpning.', '00000000-0000-0000-0000-000000000916', '00000000-0000-0000-0000-000000000901', null, 7000, 'PUBLISHED', now(), true, ARRAY['mineralull', 'isolerskiva', 'glasull']::text[], ARRAY['isolering', 'väggisolering']::text[], ARRAY['isolera vind', 'ljudisolera vägg']::text[], 'mineralullsskiva 95mm validation mineralullsskiva för vägg och vind med bra ljuddämpning validering isolering validering byggdelar isolering isolerskiva mineralull cellplast frigolit glasull väggisolering isolera vind ljudisolera vägg'),
  ('00000000-0000-0000-0000-000000000936', 'Cellplastskiva S80 validation', 'Tryckfast cellplast för grund och markisolering.', '00000000-0000-0000-0000-000000000916', '00000000-0000-0000-0000-000000000901', null, 8500, 'PUBLISHED', now(), true, ARRAY['cellplast', 'frigolit']::text[], ARRAY['isolering', 'markisolering']::text[], ARRAY['isolera grund']::text[], 'cellplastskiva s80 validation tryckfast cellplast för grund och markisolering validering isolering validering byggdelar isolering isolerskiva mineralull cellplast frigolit markisolering isolera grund'),
  ('00000000-0000-0000-0000-000000000937', 'OSB-skiva 12mm validation', 'OSB-skiva för stomme, vägg och enklare snickeri.', '00000000-0000-0000-0000-000000000917', '00000000-0000-0000-0000-000000000901', null, 3900, 'PUBLISHED', now(), true, ARRAY['osb-skiva', 'byggskiva']::text[], ARRAY['skiva', 'träskiva']::text[], ARRAY['bygga stomme']::text[], 'osb-skiva 12mm validation osb-skiva för stomme vägg och enklare snickeri validering skivmaterial validering byggdelar skiva byggskiva osb plywood träskiva bygga stomme'),
  ('00000000-0000-0000-0000-000000000938', 'Plywoodskiva björk validation', 'Plywoodskiva för möbelsnickeri, hyllor och inredning.', '00000000-0000-0000-0000-000000000917', '00000000-0000-0000-0000-000000000901', null, 4600, 'PUBLISHED', now(), true, ARRAY['plywood', 'plywoodskiva']::text[], ARRAY['skiva', 'träskiva']::text[], ARRAY['bygga hyllor']::text[], 'plywoodskiva björk validation plywoodskiva för möbelsnickeri hyllor och inredning validering skivmaterial validering byggdelar skiva byggskiva osb plywood träskiva bygga hyllor möbelsnickeri'),
  ('00000000-0000-0000-0000-000000000939', 'Parkettgolv ek validation', 'Ekparkett i gott skick för vardagsrum och sovrum.', '00000000-0000-0000-0000-000000000918', '00000000-0000-0000-0000-000000000901', null, 25000, 'PUBLISHED', now(), true, ARRAY['parkett', 'trägolv']::text[], ARRAY['golv', 'ekgolv']::text[], ARRAY['lägga golv']::text[], 'parkettgolv ek validation ekparkett i gott skick för vardagsrum och sovrum validering golv validering byggdelar golv parkett vinylgolv klickgolv klinker trägolv ekgolv lägga golv'),
  ('00000000-0000-0000-0000-000000000940', 'Vinylgolv click validation', 'Slitstarkt klickgolv för kök och hall.', '00000000-0000-0000-0000-000000000918', '00000000-0000-0000-0000-000000000901', 'ad285b8e-1371-43b3-bb1c-476021d63ec9', 18000, 'PUBLISHED', now(), true, ARRAY['vinylgolv', 'klickgolv']::text[], ARRAY['golv', 'plastgolv']::text[], ARRAY['lägga köksgolv']::text[], 'vinylgolv click validation slitstarkt klickgolv för kök och hall validering golv validering byggdelar forbo golv parkett vinylgolv klickgolv klinker plastgolv lägga köksgolv'),
  ('00000000-0000-0000-0000-000000000941', 'PVC avloppsrör 110mm validation', 'PVC-rör för spillvatten och avlopp inomhus.', '00000000-0000-0000-0000-000000000919', '00000000-0000-0000-0000-000000000901', null, 2200, 'PUBLISHED', now(), true, ARRAY['avloppsrör', 'spillvattenrör', 'pvc-rör']::text[], ARRAY['rör', 'avlopp']::text[], ARRAY['leda avlopp']::text[], 'pvc avloppsrör 110mm validation pvc-rör för spillvatten och avlopp inomhus validering rör validering byggdelar rör avloppsrör spillvattenrör dräneringsrör markrör pvc-rör avlopp leda avlopp'),
  ('00000000-0000-0000-0000-000000000942', 'Dräneringsrör 100mm validation', 'Flexibelt markrör för dränering runt husgrund.', '00000000-0000-0000-0000-000000000919', '00000000-0000-0000-0000-000000000901', null, 2400, 'PUBLISHED', now(), true, ARRAY['dräneringsrör', 'markrör', 'dränslang']::text[], ARRAY['rör', 'dränering']::text[], ARRAY['dränera grund']::text[], 'dräneringsrör 100mm validation flexibelt markrör för dränering runt husgrund validering rör validering byggdelar rör avloppsrör spillvattenrör dräneringsrör markrör dränslang dränering dränera grund'),
  ('00000000-0000-0000-0000-000000000943', 'Gipsskruv 42mm validation', 'Gipsskruv för montering av gipsskivor på träregel.', '00000000-0000-0000-0000-000000000920', '00000000-0000-0000-0000-000000000901', '8a399c5e-7068-409f-bd43-527713c7c51b', 900, 'PUBLISHED', now(), true, ARRAY['gipsskruv', 'skruv för gips']::text[], ARRAY['skruv', 'fästdon']::text[], ARRAY['montera gipsskivor']::text[], 'gipsskruv 42mm validation gipsskruv för montering av gipsskivor på träregel validering fästdon validering byggdelar fischer skruv fästdon gipsskruv betongskruv ankarskruv skruv för gips montera gipsskivor'),
  ('00000000-0000-0000-0000-000000000944', 'Betongskruv 7,5x92 validation', 'Skruv för infästning i betong och lättbetong.', '00000000-0000-0000-0000-000000000920', '00000000-0000-0000-0000-000000000901', '8a399c5e-7068-409f-bd43-527713c7c51b', 1400, 'PUBLISHED', now(), true, ARRAY['betongskruv', 'ankarskruv']::text[], ARRAY['skruv', 'fästdon']::text[], ARRAY['montera i betong']::text[], 'betongskruv 7,5x92 validation skruv för infästning i betong och lättbetong validering fästdon validering byggdelar fischer skruv fästdon gipsskruv betongskruv ankarskruv montera i betong'),
  ('00000000-0000-0000-0000-000000000945', 'Skruvdragare 18V validation', 'Batteridriven skruvdragare med två växlar för montage.', '00000000-0000-0000-0000-000000000924', '00000000-0000-0000-0000-000000000901', '6a3b0ee4-146f-46b4-8779-4816836e5370', 35000, 'PUBLISHED', now(), true, ARRAY['skruvdragare', 'borrskruvdragare']::text[], ARRAY['elverktyg', 'borrmaskin']::text[], ARRAY['skruva trall', 'borra i trä']::text[], 'skruvdragare 18v validation batteridriven skruvdragare med två växlar för montage validering elverktyg validering verktyg milwaukee elverktyg skruvdragare borrmaskin borrhammare tigersåg borrskruvdragare skruva trall borra i trä'),
  ('00000000-0000-0000-0000-000000000946', 'Borrhammare SDS validation', 'Kompakt borrhammare för betong och tegel.', '00000000-0000-0000-0000-000000000924', '00000000-0000-0000-0000-000000000901', '6a3b0ee4-146f-46b4-8779-4816836e5370', 42000, 'PUBLISHED', now(), true, ARRAY['borrhammare', 'slagborr']::text[], ARRAY['elverktyg', 'borrmaskin']::text[], ARRAY['borra i betong']::text[], 'borrhammare sds validation kompakt borrhammare för betong och tegel validering elverktyg validering verktyg milwaukee elverktyg skruvdragare borrmaskin borrhammare tigersåg slagborr borra i betong'),
  ('00000000-0000-0000-0000-000000000947', 'Fogsvans 550 mm validation', 'Handsåg för kapning av reglar och lister i trä.', '00000000-0000-0000-0000-000000000914', '00000000-0000-0000-0000-000000000901', null, 1500, 'PUBLISHED', now(), true, ARRAY['fogsvans', 'handsåg']::text[], ARRAY['såg', 'träsåg']::text[], ARRAY['såga trä']::text[], 'fogsvans 550 mm validation handsåg för kapning av reglar och lister i trä validering sågar validering verktyg såg handsåg metallsåg träsåg fogsvans såga trä'),
  ('00000000-0000-0000-0000-000000000948', 'Tigersåg validation', 'Elsåg för rivning och kapning av reglar, rör och trä.', '00000000-0000-0000-0000-000000000924', '00000000-0000-0000-0000-000000000901', '6a3b0ee4-146f-46b4-8779-4816836e5370', 37000, 'PUBLISHED', now(), true, ARRAY['tigersåg', 'recipsåg']::text[], ARRAY['såg', 'elverktyg', 'rivningssåg']::text[], ARRAY['riva vägg', 'kapa reglar']::text[], 'tigersåg validation elsåg för rivning och kapning av reglar rör och trä validering elverktyg validering verktyg milwaukee elverktyg skruvdragare borrmaskin borrhammare tigersåg såg recipsåg rivningssåg riva vägg kapa reglar'),
  ('00000000-0000-0000-0000-000000000949', 'Akustikskiva vägg validation', 'Ljudabsorberande skiva för innervägg i kontor och studio.', '00000000-0000-0000-0000-000000000917', '00000000-0000-0000-0000-000000000901', null, 6400, 'PUBLISHED', now(), true, ARRAY['akustikskiva', 'ljudskiva']::text[], ARRAY['skiva', 'väggskiva']::text[], ARRAY['dämpa ljud']::text[], 'akustikskiva vägg validation ljudabsorberande skiva för innervägg i kontor och studio validering skivmaterial validering byggdelar skiva byggskiva osb plywood träskiva akustikskiva ljudskiva väggskiva dämpa ljud'),
  ('00000000-0000-0000-0000-000000000950', 'Klinkerplatta grå validation', 'Klinker för badrumsgolv och tvättstuga med halksäker yta.', '00000000-0000-0000-0000-000000000918', '00000000-0000-0000-0000-000000000901', null, 6900, 'PUBLISHED', now(), true, ARRAY['klinker', 'golvplatta']::text[], ARRAY['golv', 'badrumsgolv']::text[], ARRAY['renovera badrum']::text[], 'klinkerplatta grå validation klinker för badrumsgolv och tvättstuga med halksäker yta validering golv validering byggdelar golv parkett vinylgolv klickgolv klinker golvplatta badrumsgolv renovera badrum');

UPDATE product p
SET "searchDocument" = lower(
  regexp_replace(
    trim(
      concat_ws(
        ' ',
        p.title,
        p.description,
        c.name,
        parent.name,
        (SELECT brand.name FROM brand WHERE brand.id = p."brandId"),
        array_to_string(c."searchAliases", ' '),
        array_to_string(p."searchAliases", ' '),
        array_to_string(p."searchRelatedTerms", ' '),
        array_to_string(p."searchUseCases", ' ')
      )
    ),
    '\s+',
    ' ',
    'g'
  )
)
FROM category c
LEFT JOIN category parent ON parent.id = c."parentId"
WHERE p."categoryId" = c.id
  AND p.title LIKE '%validation';

COMMIT;