import React from "react";
import { FooterSectionEntryType } from "gql/graphql";
import { FooterSectionSchemaType } from "@/schema/footer-section-schema";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button, Divider, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

type Props = {
  title: string;
  entries: FooterSectionSchemaType["entries"];
  setEntries: (entries: FooterSectionSchemaType["entries"]) => void;
};

const DragAndDropArticles = ({ title, entries, setEntries }: Props) => {
  const handleDragDrop = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const items = Array.from(entries);
    const [movedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, movedItem);

    const withOrder = items.map((item, index) => ({
      ...item,
      orderIndex: index,
    }));

    setEntries(withOrder);
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
              {entries.map((item, index) => {
                const entryKey =
                  item.article?.id ?? item.tempId ?? `entry-${index}`;
                return (
                  <Draggable
                    draggableId={String(entryKey)}
                    key={entryKey}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-[auto_30px] gap-2 rounded bg-accent_100 p-2 shadow-md"
                      >
                        {item.type === FooterSectionEntryType.Article ? (
                          <p>{item.article?.title}</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Input
                              value={item.label ?? ""}
                              placeholder="Titel"
                              onChange={(event) => {
                                const updated = entries.map(
                                  (entry, entryIndex) =>
                                    entryIndex === index
                                      ? {
                                          ...entry,
                                          label: event.target.value,
                                        }
                                      : entry,
                                );
                                setEntries(updated);
                              }}
                            />
                            <Input
                              value={item.url ?? ""}
                              placeholder="https://"
                              onChange={(event) => {
                                const updated = entries.map(
                                  (entry, entryIndex) =>
                                    entryIndex === index
                                      ? {
                                          ...entry,
                                          url: event.target.value,
                                        }
                                      : entry,
                                );
                                setEntries(updated);
                              }}
                            />
                          </div>
                        )}
                        <Button
                          icon={<DeleteOutlined />}
                          size="middle"
                          type="dashed"
                          onClick={() => {
                            const filtered = entries.filter(
                              (_, entryIndex) => entryIndex !== index,
                            );
                            setEntries(
                              filtered.map((entry, entryIndex) => ({
                                ...entry,
                                orderIndex: entryIndex,
                              })),
                            );
                          }}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DragAndDropArticles;
