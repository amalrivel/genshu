// NOTE: Current behavior: footer attribution and version are static.
// TODO: Keep identity/version accurate. See docs/developer-guide.md, Shared layout.
export default function HomeFooter() {
  return (
    <footer className="container mx-auto px-4">
      <div className="flex justify-center">
        Built by amalrivel. Student of Asahi Shimbun Scholarship.
      </div>
      <div className="flex justify-between">
        <p>Genshu-LMS for Asahi Shimbun Scholarship Student</p>
        <p>Ver 0.0.1</p>
      </div>
    </footer>
  );
}
