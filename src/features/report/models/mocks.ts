import { http, HttpResponse } from "msw";

import { handleGetReport, handleGetReports } from "@/@types/api/msw.gen";

import { type Report } from ".";

export {
  handleCreateReport,
  handleGetReportFileUploadUrl,
} from "@/@types/api/msw.gen";

export const MOCK_REPORT_UPLOAD_URL = "https://report-files.test/upload";
export const MOCK_REPORT_DOWNLOAD_URL = "https://report-files.test/download";

// Stands in for the S3 presigned PUT, which the generated handlers don't cover.
export function handleReportFileUpload(status = 200) {
  return http.put(
    `${MOCK_REPORT_UPLOAD_URL}/*`,
    () => new HttpResponse(null, { status }),
  );
}

let nextId = 1;

export function mockReport(overrides: Partial<Report> = {}): Report {
  const id = overrides.id ?? nextId++;
  return {
    id,
    name: "홍길동",
    email: "reporter@gm.gist.ac.kr",
    phone: "010-1234-5678",
    title: `제보 ${id}`,
    description: "제보 내용입니다.",
    files: [],
    createdAt: new Date("2026-10-28T12:14:00Z"),
    ...overrides,
  };
}

const at = (day: number, hour = 12, minute = 0) =>
  new Date(Date.UTC(2026, 9, day, hour, minute));

const file = (name: string) => ({ name, url: "" });

const NAMES = ["김민서", "박준", "최유진", "정다온", "이하늘", "한서준"];

export const MOCK_REPORTS: Report[] = [
  mockReport({
    id: 23,
    title: "학생회관 2층 휴게 공간 사용 관련",
    description:
      "학생회관 2층 휴게 공간이 지난주부터 별도 공지 없이 저녁 시간에 잠겨 있습니다. 시험 기간이라 공부할 공간이 부족한데, 이유를 알 수 있을까요?\n\n출입문 사진과 관리실에 문의했을 때의 통화 녹음을 함께 보냅니다.",
    files: [file("lounge-door.jpg"), file("recording.m4a")],
    createdAt: at(28, 12, 14),
  }),
  mockReport({
    id: 22,
    name: "이하늘",
    email: "sky@gm.gist.ac.kr",
    phone: "+82 10-9876-5432",
    title: null,
    description:
      "셔틀버스 배차 간격이 공지와 다르게 운영되고 있어요. 주말 오후에 특히 심합니다.",
    createdAt: at(27, 8, 40),
  }),
  mockReport({
    id: 21,
    name: "김민서",
    title: "동아리방 배정 기준이 궁금합니다",
    description: "올해 동아리방 재배정 기준이 공개되지 않았습니다.",
    files: [file("club-room.pdf")],
    createdAt: at(26),
  }),
  mockReport({
    id: 20,
    name: "박준",
    title: "도서관 냉난방 문제",
    description: "3층 열람실 난방이 아직 들어오지 않습니다.",
    createdAt: at(24),
  }),
  mockReport({
    id: 19,
    name: "익명 희망",
    title: "",
    description: "식당 메뉴 가격이 예고 없이 올랐습니다.",
    files: [file("menu.png"), file("receipt.heic"), file("price.xlsx")],
    createdAt: at(22),
  }),
  mockReport({
    id: 18,
    name: "최유진",
    title: "연구실 야간 출입 관련 제보",
    description: "야간 출입 기록 방식이 바뀌었는데 안내가 부족합니다.",
    createdAt: at(20),
  }),
  mockReport({
    id: 17,
    name: "정다온",
    title: "축제 부스 운영 후기",
    description: "축제 기간 부스 운영 중 있었던 일을 공유하고 싶습니다.",
    files: [
      file("booth-1.jpg"),
      file("booth-2.jpg"),
      file("booth.mov"),
      file("notes.txt"),
      file("photos.zip"),
    ],
    createdAt: at(18),
  }),
  ...Array.from({ length: 16 }, (_, i) =>
    mockReport({
      id: 16 - i,
      name: NAMES[i % NAMES.length],
      title: i % 4 === 1 ? null : `지난 제보 ${16 - i}`,
      description: "지난달에 들어온 제보입니다.",
      createdAt: at(17 - i, 3),
    }),
  ),
];

// The backend signs a new download URL on every `GET /report/:id`; the
// timestamp makes a refetch visibly hand out a different link.
function withFreshLinks(report: Report): Report {
  const signedAt = Date.now();
  return {
    ...report,
    files: report.files.map((f) => ({
      name: f.name,
      url: `${MOCK_REPORT_DOWNLOAD_URL}/${report.id}/${f.name}?X-Amz-Expires=600&signed=${signedAt}`,
    })),
  };
}

// Pages through `reports` like `GET /report` and serves each from
// `GET /report/:id`, 404 for the rest.
export function handleReports(reports: Report[]) {
  return [
    handleGetReports(({ request }) => {
      const params = new URL(request.url).searchParams;
      const offset = Number(params.get("offset") ?? 0);
      const limit = Number(params.get("limit") ?? 10);
      return HttpResponse.json({
        reports: reports.slice(offset, offset + limit).map(withFreshLinks),
        count: reports.length,
      });
    }),
    handleGetReport(({ params }) => {
      const report = reports.find((r) => r.id === Number(params.id));
      return report
        ? HttpResponse.json(withFreshLinks(report))
        : HttpResponse.json(
            { message: "Not Found", error: "Not Found", statusCode: 404 },
            { status: 404 },
          );
    }),
  ];
}

export function handleReportsError() {
  return handleGetReports(() =>
    HttpResponse.json(
      {
        message: "Internal Server Error",
        error: "Internal Server Error",
        statusCode: 500,
      },
      { status: 500 },
    ),
  );
}
