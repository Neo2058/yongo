export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  reading: string
  tags: string[]
  cover: string
  coverAlt: string
  featured?: boolean
  number?: string
  kicker?: string
  body: PostBlock[]
}

export const posts: BlogPost[] = [
  {
    slug: "nextjs-16-kontur",
    title: "Next.js 16: как я собираю публичный контур",
    excerpt:
      "App Router, серверные компоненты по умолчанию, params как Promise и proxy вместо middleware. Заметки с учебной сборки портфолио.",
    publishedAt: "2026-08-28",
    reading: "7 мин",
    tags: ["Next.js", "App Router"],
    cover: "/images/blog/command.jpg",
    coverAlt: "Голографический командный центр",
    featured: true,
    number: "01",
    kicker: "Web · Architecture",
    body: [
      {
        type: "p",
        text: "Публичная часть этого сайта собирается на Next.js 16 и React 19. Это не «как в старых гайдах»: middleware переименован в proxy.ts, params приходят промисом, retry в error boundary — unstable_retry. Пока пишешь поверх памяти модели, ломаешь маршруты.",
      },
      {
        type: "h2",
        text: "Сервер по умолчанию",
      },
      {
        type: "p",
        text: "Страница блога — Server Component. Данные постов лежат в репозитории, не в клиентском стейте. 'use client' оставляю листьям: меню, оверлей, кнопка наверх. Если повесить клиент на layout, в бандл уедет весь сегмент — и позже туда же утекут сессия и лишние поля.",
      },
      {
        type: "ul",
        items: [
          "layout держит chrome и не перемонтируется при переходе /blog → /blog/[slug]",
          "статья — отдельный сегмент с generateStaticParams и generateMetadata",
          "несуществующий slug вызывает notFound(), без утечки «страница есть, но закрыта»",
        ],
      },
      {
        type: "h2",
        text: "Что дальше",
      },
      {
        type: "p",
        text: "Сейчас канал только public. Закрытый блог для руководителей появится отдельно: инвайт, сессия и проверка в Data Access Layer. Скрытый URL без этих трёх слоёв — не защита.",
      },
    ],
  },
  {
    slug: "ue5-cpp-instrumenty",
    title: "UE5 и C++: игровой рантайм рядом с вебом",
    excerpt:
      "Почему игровой контур не копирую в Next.js, и как портфолио показывает realtime-работы без WebGL на каждой странице.",
    publishedAt: "2026-08-21",
    reading: "6 мин",
    tags: ["UE5", "C++"],
    cover: "/images/blog/drive.jpg",
    coverAlt: "Футуристический концепт-кар в стеклянном ангаре",
    featured: true,
    number: "02",
    kicker: "Realtime · Tools",
    body: [
      {
        type: "p",
        text: "Unreal Engine 5 и C++ — отдельный рантайм. Тащить сцену на каждую страницу портфолио как WebGL — плохой обмен: вес, батарея, a11y. На сайте кейсы живут как видео, постеры и разбор. Движок остаётся движком.",
      },
      {
        type: "h2",
        text: "Что имеет смысл показывать в вебе",
      },
      {
        type: "ul",
        items: [
          "кадры и короткий ролик с понятным контекстом задачи",
          "какие системы внутри: инвентарь, AI, сеть, пайплайн ассетов",
          "связка с DCC: 3ds Max и Blender как источник геометрии, не как «ещё один фреймворк»",
        ],
      },
      {
        type: "p",
        text: "C++ в этом контуре — не «ещё один синтаксис для REST». Это время кадра, память, модули движка. На сайте об этом пишу прямым текстом, без притворства, что React заменяет игровой цикл.",
      },
    ],
  },
  {
    slug: "nest-php-granica",
    title: "Nest.js и PHP: граница доменов, не война стеков",
    excerpt:
      "Оба бэкенда в арсенале. Для этого сайта домен пока живёт в Next.js. Nest вынесу, когда CRM заказов перестанет помещаться в Server Actions.",
    publishedAt: "2026-08-14",
    reading: "5 мин",
    tags: ["Nest.js", "PHP"],
    cover: "/images/blog/focus.jpg",
    coverAlt: "Смартфон с голографическим интерфейсом",
    featured: true,
    number: "03",
    kicker: "Backend · Boundaries",
    body: [
      {
        type: "p",
        text: "PHP остаётся навыком в портфолио, не вторым рантаймом этой витрины. Nest.js — инструмент, который подключу, когда появятся очередь писем, воронка заказов и вебхуки. До этого Server Actions и слой данных на сервере Next.js проще сопровождать.",
      },
      {
        type: "h2",
        text: "Правило границы",
      },
      {
        type: "ul",
        items: [
          "UI и BFF — Next.js 16",
          "права и выборка — Data Access Layer, не «страница спрятана»",
          "Nest — домен заказов и фоновых работ, когда они появятся",
          "PHP — отдельные системы и легаси, не смешанный монолит этого репозитория",
        ],
      },
      {
        type: "p",
        text: "Смешать три бэкенда «на всякий случай» — способ получить три модели пользователя и ни одной проверки авторизации в нужном месте.",
      },
    ],
  },
  {
    slug: "server-s-nulya",
    title: "Сервер с нуля: Linux, Docker, GitHub",
    excerpt:
      "Портфолио должно уметь жить на машине, которую я собрал сам. Образы, секреты и то, чего нельзя класть в public/.",
    publishedAt: "2026-08-07",
    reading: "6 мин",
    tags: ["Linux", "Docker"],
    cover: "/images/blog/server.jpg",
    coverAlt: "Коридор серверной со стеклянными стойками",
    featured: false,
    body: [
      {
        type: "p",
        text: "Разворачивание Linux-сервера с нуля — часть того, что я продаю как навык, и часть того, как этот сайт поедет в прод. Docker фиксирует runtime. GitHub — историю и ревью. Секреты не едут в репозиторий: .env* уже в gitignore, NEXT_PUBLIC_* считается браузером.",
      },
      {
        type: "h2",
        text: "Закрытые файлы",
      },
      {
        type: "p",
        text: "Всё, что относится к внутреннему блогу руководителей, нельзя класть в public/. Это веб-корень. Медиа для internal-канала — вне раздачи статики, с проверкой сессии. Иначе «скрытый маршрут» заканчивается прямой ссылкой на jpg.",
      },
      {
        type: "ul",
        items: [
          "один образ приложения, отдельные секреты окружения",
          "бэкап Postgres, когда появится CRM",
          "логин и инвайты — с rate limit, одинаковый 404 для чужого токена",
        ],
      },
    ],
  },
]

export function getPublishedPosts() {
  return [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

export function getFeaturedPosts() {
  return getPublishedPosts().filter((post) => post.featured)
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug)
}
