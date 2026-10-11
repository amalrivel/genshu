import { mkdir, writeFile } from "node:fs/promises";
import JSZip from "jszip";

export async function createDemoDocx() {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Default Extension="png" ContentType="image/png"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    </Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="document" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>`);
  zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8"?>
    <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/></w:style>
    </w:styles>`);
  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
      <Relationship Id="demo-link" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
      <Relationship Id="demo-image" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/demo.png"/>
    </Relationships>`);
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
      xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
      xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
      xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
      xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>
      <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Demo Word lesson</w:t></w:r></w:p>
      <w:p><w:r><w:t>Fixture pengujian, bukan materi ujian resmi.</w:t></w:r></w:p>
      <w:p><w:ruby><w:rubyPr><w:rubyAlign w:val="center"/></w:rubyPr>
        <w:rt><w:r><w:t>にほんご</w:t></w:r></w:rt>
        <w:rubyBase><w:r><w:t>日本語</w:t></w:r></w:rubyBase></w:ruby></w:p>
      <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Teks tebal</w:t></w:r>
        <w:r><w:rPr><w:i/></w:rPr><w:t xml:space="preserve"> dan miring.</w:t></w:r></w:p>
      <w:tbl><w:tblPr/><w:tblGrid><w:gridCol/><w:gridCol/></w:tblGrid>
        <w:tr><w:tc><w:p><w:r><w:t>Kata</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Arti</w:t></w:r></w:p></w:tc></w:tr>
        <w:tr><w:tc><w:p><w:r><w:t>学校</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Sekolah</w:t></w:r></w:p></w:tc></w:tr>
      </w:tbl>
      <w:p><w:hyperlink r:id="demo-link"><w:r><w:t>Tautan contoh</w:t></w:r></w:hyperlink></w:p>
      <w:p><w:r><w:drawing><wp:inline><wp:extent cx="304800" cy="304800"/>
        <wp:docPr id="1" name="Demo image" descr="Fixture gambar demo"/>
        <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="demo.png"/><pic:cNvPicPr/></pic:nvPicPr>
            <pic:blipFill><a:blip r:embed="demo-image"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
            <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="304800" cy="304800"/></a:xfrm><a:prstGeom prst="rect"/></pic:spPr>
          </pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>
      <w:sectPr/></w:body></w:document>`);
  zip.file("word/media/demo.png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3l0AAAAASUVORK5CYII=", "base64"));
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

if (import.meta.main) {
  const directory = new URL("../tests/fixtures/", import.meta.url);
  await mkdir(directory, { recursive: true });
  const path = new URL("demo-lesson.docx", directory);
  await writeFile(path, await createDemoDocx());
  console.log(`Word fixture ready: ${path.pathname}`);
}
