import { useMemo, useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";
import { createColumnHelper, type SortingState } from "@tanstack/react-table";
import {
  EllipsisIcon,
  ExternalLinkIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/common/components/ui/native-select";

import { DataTable, type dataTableFeatures } from ".";

type Article = {
  id: string;
  title: string;
  sub: string;
  categories: string[];
  authors: string;
  views: number;
  created: string;
  updated: string;
};

const articles: Article[] = [
  {
    id: "1",
    title: "연구실 안전 점검 항목 개편, 현장에서는 무엇이 달라졌나",
    sub: "점검표가 바뀐 첫 학기, 대학원생과 담당 부서의 이야기를 들었다",
    categories: ["학술·연구", "연구"],
    authors: "김도윤, 이서연",
    views: 1204,
    created: "2026.10.28",
    updated: "2026.10.28",
  },
  {
    id: "2",
    title: "2학기 수강 정정 기간 하루 연장된다",
    sub: "",
    categories: ["대학"],
    authors: "박지호",
    views: 842,
    created: "2026.10.28",
    updated: "—",
  },
  {
    id: "3",
    title: "가을 축제 사흘간의 기록",
    sub: "사진으로 본 축제 현장",
    categories: ["문화"],
    authors: "최하은",
    views: 1032,
    created: "2026.10.27",
    updated: "2026.10.27",
  },
  {
    id: "4",
    title: "광주 첨단지구 버스 노선 개편안, 학생 의견 수렴 시작",
    sub: "",
    categories: ["사회"],
    authors: "김도윤",
    views: 611,
    created: "2026.10.27",
    updated: "—",
  },
  {
    id: "5",
    title: "마감 전날 밤, 편집실의 불은 꺼지지 않는다",
    sub: "",
    categories: ["오피니언", "내부 칼럼"],
    authors: "정민준",
    views: 388,
    created: "2026.10.26",
    updated: "—",
  },
];

const views = (n: number) => n.toLocaleString("ko-KR");

const col = createColumnHelper<typeof dataTableFeatures, Article>();

const columns = col.columns([
  col.accessor("title", {
    header: "제목",
    meta: { className: "min-w-64 max-w-90" },
    cell: ({ row }) => (
      <a href="#" className="flex flex-col gap-1">
        <span className="font-bold">{row.original.title}</span>
        {row.original.sub && (
          <span className="text-2xs text-subtle-foreground">
            {row.original.sub}
          </span>
        )}
      </a>
    ),
  }),
  col.accessor("categories", {
    header: "카테고리",
    cell: ({ getValue }) => (
      <span className="flex flex-wrap gap-1">
        {getValue().map((c) => (
          <Badge key={c}>{c}</Badge>
        ))}
      </span>
    ),
  }),
  col.accessor("authors", {
    header: "작성자",
    meta: { className: "whitespace-nowrap text-muted-foreground" },
  }),
  col.accessor("views", {
    header: "조회수",
    enableSorting: true,
    meta: { className: "text-right tabular-nums" },
    cell: ({ getValue }) => views(getValue()),
  }),
  col.accessor("created", {
    header: "작성일",
    enableSorting: true,
    meta: { className: "whitespace-nowrap text-muted-foreground tabular-nums" },
  }),
  col.accessor("updated", {
    header: "수정일",
    meta: { className: "whitespace-nowrap text-muted-foreground tabular-nums" },
  }),
  col.display({
    id: "actions",
    header: () => <span className="sr-only">작업</span>,
    cell: () => (
      <span className="flex justify-end gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="사이트에서 보기">
          <ExternalLinkIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="수정">
          <PencilIcon />
        </Button>
        <Button variant="destructive-ghost" size="icon-sm" aria-label="삭제">
          <Trash2Icon />
        </Button>
      </span>
    ),
  }),
]);

function ArticlesTable({ data }: { data: Article[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created", desc: true },
  ]);

  const sorted = useMemo(() => {
    const [s] = sorting;
    if (!s) return data;
    const key = s.id as "views" | "created";
    return [...data].sort(
      (a, b) =>
        (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * (s.desc ? -1 : 1),
    );
  }, [data, sorting]);

  return (
    <DataTable
      caption="기사 목록"
      columns={columns}
      data={sorted}
      getRowId={(a) => a.id}
      sorting={sorting}
      onSortingChange={setSorting}
      empty="조건에 맞는 기사가 없습니다"
      renderMobileItem={({ original: a }) => (
        <>
          <span className="flex flex-wrap gap-1">
            {a.categories.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </span>
          <a href="#" className="leading-[1.45] font-bold">
            {a.title}
          </a>
          <div className="flex items-center justify-between gap-2">
            <span className="flex flex-wrap items-center gap-x-2 text-2xs text-subtle-foreground tabular-nums">
              <span>{a.authors}</span>
              <span>{a.created}</span>
              <span>조회 {views(a.views)}</span>
            </span>
            <Button variant="ghost" size="icon-sm" aria-label="작업 메뉴">
              <EllipsisIcon />
            </Button>
          </div>
        </>
      )}
    />
  );
}

type Permission = "EDITORSHIP" | "EDITOR" | "NONE";

const roles: Record<string, Permission> = {
  편집장: "EDITORSHIP",
  부편집장: "EDITOR",
  "취재부 책임기자": "EDITOR",
  "디지털콘텐츠부 책임기자": "EDITOR",
  "책임 디자이너": "EDITOR",
  "취재부 정기자": "NONE",
  "디지털콘텐츠부 정기자": "NONE",
  디자이너: "NONE",
  수습기자: "NONE",
  "거쳐간 사람": "NONE",
};

const permissions = {
  EDITORSHIP: { label: "전체 관리", becomes: "전체 관리로", variant: "brand" },
  EDITOR: { label: "편집", becomes: "편집으로", variant: "info" },
  NONE: { label: "권한 없음", becomes: "권한 없음으로", variant: "neutral" },
} as const;

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
  photo?: boolean;
  me?: boolean;
};

const photo =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill='%23c9d3dc'/></svg>";

const initialMembers: Member[] = [
  {
    id: "1",
    name: "김도윤",
    email: "doyun@gm.gist.ac.kr",
    role: "편집장",
    joined: "2025.03.02",
    photo: true,
    me: true,
  },
  {
    id: "2",
    name: "이서연",
    email: "seoyeon@gm.gist.ac.kr",
    role: "부편집장",
    joined: "2025.03.02",
    photo: true,
  },
  {
    id: "3",
    name: "박지호",
    email: "jiho@gm.gist.ac.kr",
    role: "취재부 책임기자",
    joined: "2025.03.10",
  },
  {
    id: "4",
    name: "최하은",
    email: "haeun@gm.gist.ac.kr",
    role: "디자이너",
    joined: "2025.09.01",
  },
  {
    id: "5",
    name: "정민준",
    email: "minjun@gm.gist.ac.kr",
    role: "디지털콘텐츠부 책임기자",
    joined: "2025.03.10",
    photo: true,
  },
  {
    id: "6",
    name: "한지우",
    email: "jiwoo@gm.gist.ac.kr",
    role: "취재부 정기자",
    joined: "2025.09.01",
  },
  {
    id: "7",
    name: "오세린",
    email: "serin@gm.gist.ac.kr",
    role: "수습기자",
    joined: "2026.09.05",
  },
  {
    id: "8",
    name: "윤태오",
    email: "taeo@gm.gist.ac.kr",
    role: "거쳐간 사람",
    joined: "2024.03.04",
  },
];

function MemberAvatar({ m }: { m: Member }) {
  return (
    <Avatar aria-hidden>
      {m.photo && <AvatarImage src={photo} alt="" />}
      <AvatarFallback>{m.name[0]}</AvatarFallback>
    </Avatar>
  );
}

function PermissionBadge({ role }: { role: string }) {
  const p = permissions[roles[role]];
  return <Badge variant={p.variant}>{p.label}</Badge>;
}

const member = createColumnHelper<typeof dataTableFeatures, Member>();

function MembersTable() {
  const [members, setMembers] = useState(initialMembers);
  const [editing, setEditing] = useState<{ id: string; role: string } | null>({
    id: "4",
    role: "책임 디자이너",
  });

  const columns = useMemo(
    () =>
      member.columns([
        member.accessor("name", {
          header: "멤버",
          meta: { className: "whitespace-nowrap" },
          cell: ({ row: { original: m } }) => (
            <span className="flex items-center gap-3">
              <MemberAvatar m={m} />
              <span className="flex flex-col">
                <span className="flex items-center gap-1.5 font-bold">
                  {m.name}
                  {m.me && <Badge>나</Badge>}
                </span>
                <span className="text-2xs text-subtle-foreground">
                  {m.email}
                </span>
              </span>
            </span>
          ),
        }),
        member.accessor("role", {
          header: "직책",
          meta: { className: "whitespace-nowrap" },
          cell: ({ row: { original: m } }) =>
            editing?.id === m.id ? (
              <NativeSelect
                aria-label={`${m.name} 직책`}
                className="w-56"
                value={editing.role}
                onChange={(e) => setEditing({ id: m.id, role: e.target.value })}
              >
                {Object.keys(roles).map((r) => (
                  <NativeSelectOption key={r}>{r}</NativeSelectOption>
                ))}
              </NativeSelect>
            ) : (
              m.role
            ),
        }),
        member.display({
          id: "permission",
          header: "권한",
          meta: { className: "whitespace-nowrap" },
          cell: ({ row: { original: m } }) => {
            const next =
              editing?.id === m.id && roles[editing.role] !== roles[m.role]
                ? permissions[roles[editing.role]]
                : null;
            return (
              <span className="flex items-center gap-2">
                <PermissionBadge role={m.role} />
                {next && (
                  <span className="text-2xs text-subtle-foreground">
                    → {next.becomes} 바뀝니다
                  </span>
                )}
              </span>
            );
          },
        }),
        member.accessor("joined", {
          header: "등록일",
          meta: {
            className: "whitespace-nowrap text-muted-foreground tabular-nums",
          },
        }),
        member.display({
          id: "actions",
          header: () => <span className="sr-only">작업</span>,
          cell: ({ row: { original: m } }) =>
            editing?.id === m.id ? (
              <span className="flex justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(null)}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setMembers((all) =>
                      all.map((x) =>
                        x.id === m.id ? { ...x, role: editing.role } : x,
                      ),
                    );
                    setEditing(null);
                  }}
                >
                  저장
                </Button>
              </span>
            ) : (
              <span className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${m.name} 수정`}
                  onClick={() => setEditing({ id: m.id, role: m.role })}
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="destructive-ghost"
                  size="icon-sm"
                  aria-label={`${m.name} 삭제`}
                >
                  <Trash2Icon />
                </Button>
              </span>
            ),
        }),
      ]),
    [editing],
  );

  return (
    <DataTable
      caption="멤버 목록"
      columns={columns}
      data={members}
      getRowId={(m) => m.id}
      rowClassName={({ original: m }) =>
        editing?.id === m.id
          ? "bg-surface"
          : m.role === "거쳐간 사람"
            ? "text-subtle-foreground"
            : undefined
      }
      renderMobileItem={({ original: m }) => (
        <>
          <div className="flex items-center gap-3">
            <MemberAvatar m={m} />
            <span className="flex grow flex-col">
              <span className="font-bold">{m.name}</span>
              <span className="text-2xs text-subtle-foreground">{m.email}</span>
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`${m.name} 작업 메뉴`}
            >
              <EllipsisIcon />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{m.role}</span>
            <PermissionBadge role={m.role} />
          </div>
        </>
      )}
    />
  );
}

const meta = {
  title: "Common/DataTable",
  render: () => <ArticlesTable data={articles} />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
export const Empty: Story = { render: () => <ArticlesTable data={[]} /> };
export const Members: Story = { render: () => <MembersTable /> };
export const MembersMobile: Story = {
  render: () => <MembersTable />,
  globals: { viewport: { value: "mobile" } },
};
