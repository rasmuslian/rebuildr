import React from "react";
import { Article } from "gql/graphql";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Divider } from "antd";
import FooterSectionArticle from "@components/footer/footer-section-article";

type Props = {
  title: string;
  articles: Article[];
  setArticles: (articles: Article[]) => void;
};

const DragAndDropArticles = ({ title, articles, setArticles }: Props) => {
  const handleDragDrop = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const items = Array.from(articles);
    const [movedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, movedItem);

    setArticles(items);
  };

  return (
    <div className="flex flex-col gap-3">
      <Divider>{title}</Divider>

      <DragDropContext onDragEnd={handleDragDrop}>
        <Droppable droppableId="footer-sections-items">
          {(provided) => (
            <div
              className="flex flex-col gap-3"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {articles.map((item, index) => (
                <Draggable
                  draggableId={String(item.id)}
                  key={item.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <FooterSectionArticle article={item} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DragAndDropArticles;
