import { AboutSidebar } from "@/components/about/about-sidebar";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AboutSidebar />
      <main className="w-full lg:w-[70vw] lg:ml-auto px-6">{children}</main>
    </div>
  );
}
