import Button from "./ui/Button";
import { ITodo } from "../interfaces";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { ChangeEvent, FormEvent, useState } from "react";
import Textarea from "./ui/Textarea";
import axiosInstance from "../config/axios.config";
import TodoSkeleton from "./TodoSkeleton";
import { faker } from '@faker-js/faker';

const TodoList = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;


  const [queryVersion, setQueryVersion] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [todoToAdd, setTodoToAdd] = useState({
    title: "",
    description: "",
  });

  const [todoToEdit, setTodoToEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: "",
  });
  const { isLoading, data } = useCustomQuery({
    queryKey: ["todoList", `${queryVersion}`],
    url: "/users/me?populate=todos",
    config: {
      headers: {
        Authorization: `Bearer ${userData.jwt}`,
      },
    },
  });

  // Handlers
  const onCloseAddModal = () => {
    setTodoToAdd({
      title: "",
      description: "",
    });
    setIsOpenAddModal(false);
  };
  const onOpenAddModal = () => {
    setIsOpenAddModal(true);
  };

  const onCloseEditModal = () => {
    setTodoToEdit({
      id: 0,
      title: "",
      description: "",
    });
    setIsEditModalOpen(false);
  };
  const onOpenEditModal = (todo: ITodo) => {
    setTodoToEdit(todo);
    setIsEditModalOpen(true);
  };
  const closeConfirmModal = () => {
    setTodoToEdit({
      id: 0,
      title: "",
      description: "",
    });
    setIsOpenConfirmModal(false);
  };
  const openConfirmModal = (todo: ITodo) => {
    setTodoToEdit(todo);
    setIsOpenConfirmModal(true);
  };

  const onChangeAddTodoHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(event);
    const { value, name } = event.target;
    setTodoToAdd({
      ...todoToAdd,
      [name]: value,
    });
  };

  const onChangeHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(event);
    const { value, name } = event.target;
    setTodoToEdit({
      ...todoToEdit,
      [name]: value,
    });
  };

  const onGenerateTodos = async()=>{
    for (let i = 0; i < 15; i++) {
      try {
        await axiosInstance.post(
          `/todos`,
          { data: { title: faker.word.words(5), description:faker.lorem.paragraph(2), user:[userData.user.id] } },
          {
            headers: {
              Authorization: `Bearer ${userData.jwt}`,
            },
          }
        );
      } catch (error) {
        console.log(error);
      } 
    }
  };


  const onRemove = async () => {
    try {
      const { status } = await axiosInstance.delete(`/todos/${todoToEdit.id}`, {
        headers: {
          Authorization: `Bearer ${userData.jwt}`,
        },
      });
      if (status === 200) {
        closeConfirmModal();
        setQueryVersion(prev => prev + 1)
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sumbitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true);

    const { title, description } = todoToEdit;
    try {
      const { status } = await axiosInstance.put(
        `/todos/${todoToEdit.id}`,
        { data: { title, description } },
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );
      if (status === 200) {
        onCloseEditModal();
        setQueryVersion(prev => prev + 1)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const onsumbitAddtodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true);

    const { title, description } = todoToAdd;
    try {
      const { status } = await axiosInstance.post(
        `/todos`,
        { data: { title, description, user:[userData.user.id] } },
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );
      if (status === 200) {
        onCloseAddModal();
        setQueryVersion(prev => prev + 1)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading)
    return (
      <div className="space-y-1">
        {Array.from({ length: 3 }, (_, index) => (
          <TodoSkeleton key={index} />
        ))}
      </div>
    );

  return (
    <div className="space-y-1 p-3">
      <div className="w-fit mx-auto my-10">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-32 h-9 bg-gray-300 rounded-md dark:bg-gray-400"></div>
            <div className="w-32 h-9 bg-gray-300 rounded-md dark:bg-gray-400"></div>
          </div>
        ) : (
          <div className="w-fit mx-auto my-10">
          <Button size={"sm"} onClick={onOpenAddModal}>
            Post new todo
          </Button>
          <Button variant={'outline'} size={"sm"} onClick={onGenerateTodos}>
            Generate todos
          </Button>
        </div>
        )} 

      </div>
      {data.todos.length ? (
        data.todos.map((todo: ITodo) => (
          <div
            key={todo.id}
            className="flex items-center even:bg-gray-100 justify-between hover:bg-gray-100 duration-300 p-3 rounded-md"
          >
            <p className="w-full font-semibold">
              {todo.id} - {todo.title}
            </p>
            <div className="flex items-center justify-end w-full space-x-3">
              <Button onClick={() => onOpenEditModal(todo)} size="sm">
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => openConfirmModal(todo)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))
      ) : (
        <h3>No todos yet!</h3>
      )}

      {/* Add todo modal */}
      <Modal
        closeModal={onCloseAddModal}
        isOpen={isOpenAddModal}
        title="Add a new todo"
      >
        <form onSubmit={onsumbitAddtodo} className="space-y-4">
          <Input
            name="title"
            onChange={onChangeAddTodoHandler}
            value={todoToAdd.title}
          />
          <Textarea
            name="description"
            onChange={onChangeAddTodoHandler}
            value={todoToAdd.description}
          />
          <div className="flex items-center space-x-3 mt-4">
            <Button
              isLoading={isUpdating}
              className="bg-indigo-700 hover:bg-indigo"
            >
              Done
            </Button>
            <Button type="button" variant={"cancel"} onClick={onCloseAddModal}>
              Cancle
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit todo modal */}
      <Modal
        closeModal={onCloseEditModal}
        isOpen={isEditModalOpen}
        title="Edit this todo"
      >
        <form onSubmit={sumbitHandler} className="space-y-4">
          <Input
            name="title"
            onChange={onChangeHandler}
            value={todoToEdit.title}
          />
          <Textarea
            name="description"
            onChange={onChangeHandler}
            value={todoToEdit.description}
          />
          <div className="flex items-center space-x-3 mt-4">
            <Button
              isLoading={isUpdating}
              className="bg-indigo-700 hover:bg-indigo"
            >
              Update
            </Button>
            <Button type="button" variant={"cancel"} onClick={onCloseEditModal}>
              Cancle
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete todo Confirm modal */}
      <Modal
        closeModal={closeConfirmModal}
        isOpen={isOpenConfirmModal}
        title="Edit this todo"
        description="Deleting this todo will remove "
      >
        <div className="flex items-center space-x-3">
          <Button onClick={onRemove} variant={"danger"}>
            Yes, Remove
          </Button>
          <Button type="button" variant={"cancel"} onClick={closeConfirmModal}>
            Cancle
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TodoList;
