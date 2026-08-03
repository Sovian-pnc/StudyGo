# Внешние изображения

## Локализованные ресурсы

Встроенные в исходный HTML изображения извлечены без перекодирования в `assets/images/embedded-*`.

Доступные изображения Unsplash скачаны по исходным адресам и подключены локально:

| Исходный URL | Локальный файл |
|---|---|
| `https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=84` | `assets/images/hero-students-main.jpg` |
| `https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=700&q=84` | `assets/images/hero-students-group.jpg` |
| `https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=82` | `assets/images/unsplash-1498243691581-1200-q82.jpg` |
| `https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=84` | `assets/images/unsplash-1498243691581-1200-q84.jpg` |
| `https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=82` | `assets/images/unsplash-1523240795612-1200-q82.jpg` |
| `https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=82` | `assets/images/unsplash-1541339907198-1200-q82.jpg` |
| `https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=84` | `assets/images/unsplash-1541339907198-1200-q84.jpg` |
| `https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=82` | `assets/images/unsplash-1562774053-1200-q82.jpg` |
| `https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=84` | `assets/images/unsplash-1562774053-1200-q84.jpg` |
| `https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1200&q=82` | `assets/images/unsplash-1564981797816-1200-q82.jpg` |
| `https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1200&q=84` | `assets/images/unsplash-1564981797816-1200-q84.jpg` |
| `https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?auto=format&fit=crop&w=1200&q=82` | `assets/images/unsplash-1567168544813-1200-q82.jpg` |
| `https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=1200&q=82` | `assets/images/unsplash-1606761568499-1200-q82.jpg` |
| `https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=1200&q=84` | `assets/images/unsplash-1606761568499-1200-q84.jpg` |

## Оригинальные изображения StudyGo

В предыдущей версии были созданы и подключены локально четыре оригинальных изображения:

- `assets/images/original/studygo-graduates.png`;
- `assets/images/original/studygo-student-life.png`;
- `assets/images/original/studygo-campus-red.png`;
- `assets/images/original/studygo-social-card.png`.

Они не зависят от внешних фотостоков и используются в маршрутах, статьях и как резервные изображения карточек.

В версии v5 дополнительно созданы изображения с Ариной как цифровым гидом, «окно в Китай» и новая социальная карточка. Их статус и реальные лицензированные фотографии кампусов перечислены в `ASSET_CREDITS.md`.

## Сохранённые внешние адреса

В `external-image-urls.txt` перечислены 207 точных адресов, которые присутствовали в исходном исследовательском прототипе:

- 160 адресов миниатюр `tse1.mm.bing.net`;
- 44 адреса снимков сайтов `image.thum.io`;
- 3 варианта одного недоступного изображения Unsplash.

Недоступные варианты Unsplash возвращали HTTP 404 и поэтому сохранены без подмены:

- `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=82`
- `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=84`
- `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=84`

Bing использовался исходным прототипом как динамический источник карточек и не был массово скачан, поскольку источник не предоставляет достаточной информации о правах на каждое изображение. В v5 первые четыре карточки используют локальные фотографии реальных кампусов с атрибуцией. Для остальных записей с официальным URL используется превью самого официального сайта через Thum.io; при его недоступности срабатывает локальная визуализация StudyGo.

Лицензия Unsplash разрешает широкое использование изображений, но не заменяет проверку прав на узнаваемых людей, бренды, произведения и другие объекты внутри кадра: <https://unsplash.com/license>.

## Живые данные

Погодный блок запрашивает текущие данные Гуанчжоу у Open‑Meteo:

- `https://api.open-meteo.com/v1/forecast?latitude=23.1291&longitude=113.2644&current=temperature_2m,weather_code&timezone=Asia%2FShanghai`

Если запрос недоступен, сайт продолжает работать и показывает нейтральное сообщение вместо погоды.
