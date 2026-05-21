import React, { useRef } from "react";
import { Editor as TinyEditor } from "@tinymce/tinymce-react";
import { Editor } from "tinymce";
import { contentStyle } from "./content-style";
import { Modal } from "antd";
import ImageLibrary from "@components/file/image-library";
import DocumentLibrary from "@components/file/document-library";
import CTAModal from "@components/editor/cta-modal";
import { CTASchemaType } from "@/schema/cta-schema";
import { useState } from "@/hooks/use-state";
import { LinkGroupSchemaType } from "@/schema/link-group-schema";
import LinkGroupModal from "./link.group-modal";

type Props = {
  value?: string;
  setValue: (param: string) => void;
  height?: number;
  placeholder: string;
};

const createAccordionHTML = () => `
  <details class="accordion" open="open">
    <summary>Rubrik ...</summary>
    <p>Brödtext ...</p>
  </details>
`;

type StateType = {
  ctaNode?: HTMLElement;
  ctaData: CTASchemaType;
  linkGroupNode?: HTMLElement;
  linkGroupData: LinkGroupSchemaType;
  isImageLibraryOpen: boolean;
  isDocumentLibraryOpen: boolean;
  isCTAModalOpen: boolean;
  isLinkGroupModalOpen: boolean;
};

const initialState: StateType = {
  ctaNode: undefined,
  ctaData: {
    title: "",
    description: "",
    button: {
      label: "",
      link: "",
    },
  },
  linkGroupNode: undefined,
  linkGroupData: {
    links: [
      {
        title: "",
        description: "",
        link: "",
      },
    ],
  },
  isImageLibraryOpen: false,
  isDocumentLibraryOpen: false,
  isCTAModalOpen: false,
  isLinkGroupModalOpen: false,
};

const TextEditor = ({ value, setValue, height = 900, placeholder }: Props) => {
  const [state, setState] = useState(initialState);
  const editorRef = useRef<Editor | undefined>(undefined);

  const commitEditorChange = () => {
    if (!editorRef.current) return;
    editorRef.current.dispatch("change");
    editorRef.current.setDirty(true);
  };

  const insertImage = (imageSource: string) => {
    if (!editorRef.current) return;
    const html = `<figure class="image"><img src="${imageSource}" alt="" /></figure>`;
    editorRef.current.execCommand("InsertHTML", false, html);
    editorRef.current.execCommand("InsertNewBlockAfter");
    setState({ isImageLibraryOpen: false });
  };

  const insertDocument = (url: string) => {
    if (!editorRef.current) return;
    editorRef.current.execCommand("CreateLink", false, url);
    setState({ isDocumentLibraryOpen: false });
  };

  const insertDivider = () => {
    if (!editorRef.current) return;
    const html = `<div class="divider" />`;
    editorRef.current.execCommand("InsertHTML", false, html);
    editorRef.current.execCommand("InsertNewBlockAfter");
  };

  const insertCTABlock = (formData: CTASchemaType) => {
    if (!editorRef.current) return;

    const html = `
    <div class="cta-block">
      <h2>${formData.title}</h2>
      <p>${formData.description}</p>
      <button data-link="${formData.button.link}">${formData.button.label}</button>
    </div>
  `;

    if (state.ctaNode) {
      editorRef.current.dom.setOuterHTML(state.ctaNode, html);
    } else {
      editorRef.current.execCommand("InsertHTML", false, html);
      editorRef.current.execCommand("InsertNewBlockAfter");
    }

    commitEditorChange();
    setState({ ...initialState });
  };

  const inserLinkGroupBlock = (formData: LinkGroupSchemaType) => {
    if (!editorRef.current) return;

    const listItemsHTML = formData.links
      .map(
        (link) => `
        <li>
          <label>${link.title}</label>
          ${link.description ? `<p>${link.description}</p>` : ""}
          <button data-link="${link.link}"/>
        </li>
      `,
      )
      .join("");

    const html = `<ul class="link-group">${listItemsHTML}</ul>`;

    if (state.linkGroupNode) {
      editorRef.current.dom.setOuterHTML(state.linkGroupNode, html);
    } else {
      editorRef.current.execCommand("InsertHTML", false, html);
      editorRef.current.execCommand("InsertNewBlockAfter");
    }

    commitEditorChange();
    setState({ ...initialState });
  };

  const deleteCTAblock = () => {
    if (!editorRef.current) return;
    const node = state.ctaNode as HTMLElement;
    if (node) {
      editorRef.current.dom.remove(node);
      commitEditorChange();
    }
    setState({ ...initialState });
  };

  const deleteLinkGroupBlock = () => {
    if (!editorRef.current) return;
    const node = state.linkGroupNode as HTMLElement;
    if (node) {
      editorRef.current.dom.remove(node);
      commitEditorChange();
    }
    setState({ ...initialState });
  };

  const setupEditor = (editor: Editor) => {
    editorRef.current = editor;

    editor.ui.registry.addMenuButton("insertButton", {
      icon: "plus",
      text: "Infoga",
      fetch: (callback) => {
        callback([
          {
            type: "menuitem",
            icon: "image",
            text: "Image Library",
            onAction: () => setState({ isImageLibraryOpen: true }),
          },
          {
            type: "menuitem",
            icon: "new-document",
            text: "Document Library",
            onAction: () => setState({ isDocumentLibraryOpen: true }),
          },
          {
            type: "menuitem",
            icon: "accordion",
            text: "Accordion",
            onAction: () => editor.insertContent(createAccordionHTML()),
          },
          {
            type: "menuitem",
            icon: "link",
            text: "Link grupp",
            onAction: () => setState({ isLinkGroupModalOpen: true }),
          },
          {
            type: "menuitem",
            icon: "addTag",
            text: "CTA",
            onAction: () => setState({ isCTAModalOpen: true }),
          },
          {
            type: "menuitem",
            icon: "horizontal-rule",
            text: "Divider",
            onAction: () => insertDivider(),
          },
        ]);
      },
    });

    editor.on("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const ctaBlock = target.closest(".cta-block");
      const linkGroup = target.closest(".link-group");

      if (ctaBlock) {
        const h2 = ctaBlock.querySelector<HTMLAnchorElement>("h2");
        const p = ctaBlock.querySelector<HTMLAnchorElement>("p");
        const button = ctaBlock.querySelector<HTMLAnchorElement>("button");
        const emptyCTA = initialState.ctaData;

        setState({
          isCTAModalOpen: true,
          ctaNode: ctaBlock as HTMLElement,
          ctaData: {
            title: h2?.textContent ?? emptyCTA.title,
            description: p?.textContent ?? emptyCTA.description,
            button: {
              label: button?.textContent ?? emptyCTA.button.label,
              link: button?.dataset.link ?? emptyCTA.button.link,
            },
          },
        });
      }

      if (linkGroup) {
        const items = Array.from(linkGroup.querySelectorAll("li")).map((li) => {
          const label = li.querySelector<HTMLAnchorElement>("label");
          const p = li.querySelector<HTMLParagraphElement>("p");
          const button = li.querySelector<HTMLParagraphElement>("button");
          const emptyLink = initialState.linkGroupData.links[0];

          return {
            title: label?.textContent ?? emptyLink.title,
            description: p?.textContent ?? emptyLink.description,
            link: button?.dataset.link ?? emptyLink.link,
          };
        });

        setState({
          isLinkGroupModalOpen: true,
          linkGroupNode: linkGroup as HTMLElement,
          linkGroupData: { links: items },
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <TinyEditor
        id={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        value={value}
        onEditorChange={(content) => setValue(content)}
        init={{
          placeholder,
          valid_styles: "none",
          block_formats: "Headline=h1;Subheadline=h2;Body=p;",
          themes: "modern",
          menubar: false,
          min_height: height,
          plugins: [
            "autolink",
            "link",
            "image",
            "anchor",
            "accordion",
            "wordcount",
            "charmap",
            "autoresize",
            "lists",
          ],
          toolbar:
            "undo redo | blocks | bold | numlist bullist | link unlink | insertButton",
          formats: {
            h1: { block: "h1" },
            h2: { block: "h2" },
          },
          forced_root_block: "p",
          toolbar_sticky: true,
          image_dimensions: false,
          media_dimensions: false,
          image_caption: false,
          object_resizing: false,
          link_title: false,
          relative_urls: false,
          valid_children:
            "+body[figure],-p[img],-h1[img],-h2[img],-h3[img],-h4[img],-h5[img],-h6[img],-li[img]",
          extended_valid_elements: "figure[class],img[src|alt|class]",
          content_style: contentStyle,
          setup: setupEditor,
        }}
      />

      <Modal
        open={state.isImageLibraryOpen}
        onCancel={() => setState({ isImageLibraryOpen: false })}
        footer={false}
        width={980}
      >
        <ImageLibrary onSelectImage={insertImage} />
      </Modal>

      <Modal
        open={state.isDocumentLibraryOpen}
        onCancel={() => setState({ isDocumentLibraryOpen: false })}
        footer={false}
        width={980}
      >
        <DocumentLibrary onSelectLink={insertDocument} />
      </Modal>

      <CTAModal
        title={state.ctaNode ? "Redigera cta block" : "Skapa cta block"}
        open={state.isCTAModalOpen}
        onCancel={() => setState({ ...initialState })}
        onSubmit={insertCTABlock}
        defaultValues={state.ctaData}
        onDelete={state.ctaNode ? deleteCTAblock : undefined}
      />

      <LinkGroupModal
        title={
          state.linkGroupNode ? "Redigera länkgruppen" : "Skapa en länkgrupp"
        }
        open={state.isLinkGroupModalOpen}
        onCancel={() => setState({ ...initialState })}
        onSubmit={inserLinkGroupBlock}
        defaultValues={state.linkGroupData}
        onDelete={state.linkGroupNode ? deleteLinkGroupBlock : undefined}
      />
    </div>
  );
};

export default TextEditor;
