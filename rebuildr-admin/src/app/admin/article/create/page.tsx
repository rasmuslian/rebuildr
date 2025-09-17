"use client";

import React, { useState } from "react";
import { Button, App } from "antd";
import TextEditor from "@/components/editor/text-editor";
import ArticlePreview from "@/components/article/article-preview";

const CreateArticlePage = () => {
  const [value, setValue] = useState("");
  const { notification } = App.useApp();

  return (
    <div className="grid max-w-screen-2xl grid-cols-[auto_375px] gap-5">
      <div className="flex flex-col gap-5">
        <TextEditor value={value} setValue={setValue} />

        <Button
          type="primary"
          onClick={() => {
            console.log(value);
          }}
        >
          Spara
        </Button>
      </div>

      <ArticlePreview html={value} />
    </div>
  );
};

export default CreateArticlePage;
