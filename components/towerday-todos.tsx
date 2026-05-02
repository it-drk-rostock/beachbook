import { useRef, useState } from "react";
import { Pressable, TextInput as RNTextInput, View } from "react-native";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDb } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import {
  IconPlus,
  IconX,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react-native";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { TextInput } from "@/components/text-input";
import { Spacer } from "@/components/spacer";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";

const editTodoSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  comment: z.string(),
});

const addTodosSchema = z.object({
  todos: z
    .array(z.object({ title: z.string().min(1, "Titel ist erforderlich") }))
    .min(1),
});

type EditTodoFormData = z.infer<typeof editTodoSchema>;
type AddTodosFormData = z.infer<typeof addTodosSchema>;

interface Todo {
  id: string;
  title: string;
  commment?: string | null;
  isCompleted: boolean;
}

interface TowerdayTodosProps {
  towerdayId: string;
  organizationId: string;
  todos: Todo[];
}

export function TowerdayTodos({
  towerdayId,
  organizationId,
  todos,
}: TowerdayTodosProps) {
  const db = useDb();

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const editTitleRef = useRef<RNTextInput>(null);

  const editForm = useForm<EditTodoFormData>({
    resolver: zodResolver(editTodoSchema),
    defaultValues: { title: "", comment: "" },
  });

  const addForm = useForm<AddTodosFormData>({
    resolver: zodResolver(addTodosSchema),
    defaultValues: { todos: [{ title: "" }] },
  });

  const { fields, append, remove } = useFieldArray({
    control: addForm.control,
    name: "todos",
  });

  const toggleCompleted = (todo: Todo) => {
    db.update(app.todos, todo.id, { isCompleted: !todo.isCompleted });
  };

  const openEditTodo = (todo: Todo) => {
    setEditingTodoId(todo.id);
    editForm.reset({ title: todo.title, comment: todo.commment ?? "" });
    TrueSheet.present("towerday-edit-todo");
  };

  const saveEditTodo = (data: EditTodoFormData) => {
    if (!editingTodoId) return;
    db.update(app.todos, editingTodoId, {
      title: data.title.trim(),
      commment: data.comment.trim() || undefined,
    });
    TrueSheet.dismiss("towerday-edit-todo");
  };

  const markCompleted = () => {
    if (!editingTodoId) return;
    const todo = todos.find((t) => t.id === editingTodoId);
    if (!todo) return;
    const values = editForm.getValues();
    db.update(app.todos, editingTodoId, {
      title: values.title.trim(),
      commment: values.comment.trim() || undefined,
      isCompleted: !todo.isCompleted,
    });
    TrueSheet.dismiss("towerday-edit-todo");
  };

  const deleteTodo = () => {
    if (!editingTodoId) return;
    db.delete(app.todos, editingTodoId);
    TrueSheet.dismiss("towerday-edit-todo");
  };

  const openAddTodos = () => {
    addForm.reset({ todos: [{ title: "" }] });
    TrueSheet.present("towerday-add-todo");
  };

  const saveAllTodos = (data: AddTodosFormData) => {
    const titles = data.todos
      .map((t) => t.title.trim())
      .filter((t) => t.length > 0);
    for (const title of titles) {
      db.insert(app.todos, {
        towerdayId,
        organizationId,
        title,
        isCompleted: false,
      });
    }
    addForm.reset({ todos: [{ title: "" }] });
    TrueSheet.dismiss("towerday-add-todo");
  };

  const editingTodo = todos.find((t) => t.id === editingTodoId);

  return (
    <>
      <SectionHeader>Aufgaben</SectionHeader>

      <Spacer size="item" />

      {todos.length > 0 ? (
        <>
          <View className="rounded-2xl bg-surface-container overflow-hidden">
            {todos.map((todo, index) => (
              <View key={todo.id}>
                <Pressable
                  className="p-4 flex-row items-center gap-3 active:opacity-70"
                  onPress={() => openEditTodo(todo)}
                >
                  <Pressable
                    className={`h-6 w-6 rounded-md items-center justify-center ${
                      todo.isCompleted
                        ? "bg-primary"
                        : "border-2 border-outline-variant"
                    }`}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleCompleted(todo);
                    }}
                    hitSlop={8}
                  >
                    {todo.isCompleted && (
                      <IconCheck size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </Pressable>
                  <View className="flex-1">
                    <Typography variant="body-large" bold>
                      {todo.title}
                    </Typography>
                    {todo.isCompleted && todo.commment ? (
                      <Typography
                        variant="body-medium"
                        className="text-on-surface-variant"
                      >
                        {todo.commment}
                      </Typography>
                    ) : null}
                  </View>
                </Pressable>
                {index < todos.length - 1 && <Divider />}
              </View>
            ))}
          </View>
          <Spacer size="item" />
        </>
      ) : (
        <>
          <View className="rounded-2xl bg-surface-container p-4">
            <Typography
              variant="body-large"
              className="text-on-surface-variant"
            >
              Keine Aufgaben vorhanden
            </Typography>
          </View>
          <Spacer size="item" />
        </>
      )}

      <Button variant="light" fullWidth onPress={openAddTodos}>
        <View className="flex-row items-center gap-2">
          <IconPlus size={18} color="#008CCD" />
          <Typography variant="body-large" bold className="text-primary">
            Aufgabe hinzufügen
          </Typography>
        </View>
      </Button>

      {/* Add Todos Sheet */}
      <TrueSheet
        name="towerday-add-todo"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <View className="flex-row items-center justify-between">
            <Typography variant="title-large" bold>
              Aufgaben hinzufügen
            </Typography>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container active:opacity-70"
              onPress={() => TrueSheet.dismiss("towerday-add-todo")}
            >
              <IconX size={16} color="#41484F" />
            </Pressable>
          </View>
          <Spacer size="group" />
          {fields.map((field, index) => (
            <View key={field.id}>
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <Controller
                    control={addForm.control}
                    name={`todos.${index}.title`}
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <TextInput
                        placeholder={`Aufgabe ${index + 1}`}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={!!error}
                      />
                    )}
                  />
                </View>
                <Pressable
                  className="h-10 w-10 items-center justify-center rounded-full bg-error/10 active:opacity-70"
                  onPress={() => (fields.length > 1 ? remove(index) : addForm.reset({ todos: [{ title: "" }] }))}
                >
                  <IconTrash size={16} color="#BA1A1A" />
                </Pressable>
              </View>
              <Spacer size="compact" />
            </View>
          ))}
          <Spacer size="inline" />
          <Button
            variant="subtle"
            fullWidth
            onPress={() => append({ title: "" })}
          >
            <View className="flex-row items-center gap-2">
              <IconPlus size={16} color="#008CCD" />
              <Typography variant="label-large" className="text-primary">
                Weitere Aufgabe
              </Typography>
            </View>
          </Button>
          <Spacer size="group" />
          <Button fullWidth onPress={addForm.handleSubmit(saveAllTodos)}>
            Übernehmen
          </Button>
        </View>
      </TrueSheet>

      {/* Edit Todo Sheet */}
      <TrueSheet
        name="towerday-edit-todo"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
        onDidPresent={() => editTitleRef.current?.focus()}
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <View className="flex-row items-center justify-between">
            <Typography variant="title-large" bold>
              Aufgabe bearbeiten
            </Typography>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container active:opacity-70"
              onPress={() => TrueSheet.dismiss("towerday-edit-todo")}
            >
              <IconX size={16} color="#41484F" />
            </Pressable>
          </View>
          <Spacer size="group" />
          <Typography
            variant="label-small"
            bold
            className="text-on-surface-variant uppercase mb-1"
          >
            Titel
          </Typography>
          <Controller
            control={editForm.control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={editTitleRef}
                placeholder="Titel eingeben"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!editForm.formState.errors.title}
              />
            )}
          />
          {editForm.formState.errors.title && (
            <Typography variant="body-small" className="text-error mt-1 ml-1">
              {editForm.formState.errors.title.message}
            </Typography>
          )}
          <Spacer size="item" />
          <Typography
            variant="label-small"
            bold
            className="text-on-surface-variant uppercase mb-1"
          >
            Bemerkung
          </Typography>
          <Controller
            control={editForm.control}
            name="comment"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="z.B. Gerät fehlt, erledigt von Max ..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                className="min-h-[80px] items-start"
              />
            )}
          />
          <Spacer size="group" />
          <Button fullWidth onPress={editForm.handleSubmit(saveEditTodo)}>
            Speichern
          </Button>
          <Spacer size="compact" />
          <View className="flex-row gap-3">
            <Pressable
              className={`flex-1 flex-row items-center justify-center gap-2 rounded-full px-6 py-4 active:opacity-90 ${
                editingTodo?.isCompleted ? "bg-amber-100" : "bg-green-100"
              }`}
              onPress={markCompleted}
            >
              <IconCheck
                size={18}
                color={editingTodo?.isCompleted ? "#D97706" : "#16A34A"}
              />
              <Typography
                variant="label-large"
                bold
                className={
                  editingTodo?.isCompleted ? "text-amber-600" : "text-green-600"
                }
              >
                {editingTodo?.isCompleted ? "Unerledigt" : "Erledigt"}
              </Typography>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-error/10 px-6 py-4 active:opacity-90"
              onPress={deleteTodo}
            >
              <IconTrash size={18} color="#BA1A1A" />
              <Typography variant="label-large" bold className="text-error">
                Löschen
              </Typography>
            </Pressable>
          </View>
        </View>
      </TrueSheet>
    </>
  );
}
