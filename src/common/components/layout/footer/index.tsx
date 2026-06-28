import { IconButton } from "@/common/components/ui/icon-button";

export function Footer() {
  return (
    <footer className="bg-neutral-800 py-12 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-20 md:grid-cols-3">
          <div className="flex items-center">
            <a
              href="/"
              aria-label="홈으로 이동"
              className="inline-block cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
            >
              <img src="/logo.png" width={150} alt="지스트신문" />
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="uppercase">About Us</h4>
            <div className="text-caption flex flex-col gap-2">
              <p>광주광역시 북구 첨단과기로123 제1학생회관 3층 GIST신문사</p>
              <p>Email: editor@gist.ac.kr</p>
              <p>편집장: 김민석 | 웹관리: 최경민</p>
            </div>
            <div className="text-caption flex flex-col gap-2">
              <p>Copyright ⓒ지스트신문. All rights reserved.</p>
              <p className="underline">이메일무단수집거부</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="uppercase">Follow Us</h4>
            <div className="flex gap-3">
              <IconButton
                icon="facebook-logo"
                label="Facebook"
                href="#"
                className="h-10 w-10 bg-neutral-700 hover:bg-neutral-600"
                iconClassName="size-5"
              />
              <IconButton
                icon="instagram-logo"
                label="Instagram"
                href="#"
                className="h-10 w-10 bg-neutral-700 hover:bg-neutral-600"
                iconClassName="size-5"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
