import { ChangeEvent, useState } from "react";
import Button from "../components/ui/Button";
import Paginator from "../components/ui/Paginator";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import axiosInstance from "../config/axios.config";
import { faker } from "@faker-js/faker";
// import onGenerateTodos from "../lib/utils";

function TodosPage () {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const [page,setPage] = useState<number>(1);
  const [pageSize,setPageSize] = useState<number>(10);
  const [sortBy,setSortBy] = useState<string>("DESC");
  
  const { isLoading, data, isFetching } = useCustomQuery({
    queryKey: [`todos-page-${page}`,`${pageSize}`,`${sortBy}`],
    url: `/todos?pagination[pageSize]=${pageSize}&pagination[page]=${page}&sort=createdAt:${sortBy}`,
    config: {
      headers: {
        Authorization: `Bearer ${userData.jwt}`,
      },
    },
  });
  // ** Handlers 
  const onClickPrev =() =>{
    setPage(prev => prev - 1 )
  }
  const onClickNext =() =>{
    setPage(next => next + 1 )
  }
  const onChangePageSize = (e:ChangeEvent<HTMLSelectElement>) =>{
    setPageSize(+e.target.value)
  }
  const onChangeSortBy = (e:ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }
  const onGenerateTodos = async () => {
    //100 record
    for (let i = 0; i < 100; i++) {
      try {
        const { data } = await axiosInstance.post(
          `/todos`,
          {
            data: {
              title: faker.word.words(5),
              description: faker.lorem.paragraph(2),
              user: [userData.user.id],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${userData.jwt}`,
            },
          }
        );
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    }
  };


  if (isLoading) return <h3>Loading...</h3>
  return (
    <section className="max-w-2xl mx-auto">
      <div className="flex items-center justify-center space-x-2">
        <Button size={"sm"} onClick={onGenerateTodos}>
          Generate Todos
        </Button>
      </div>
      <div className="flex items-center justify-center space-x-2 text-md"> 
        <select onChange={onChangeSortBy} value={sortBy} className="border-2 border-indigo-600 rounded-md p-2">
          <option disabled>
            Sort by
          </option>
          <option value="ASC">Oldest</option>
          <option value="DESC">Lastest</option>
        </select>

        <select onChange={onChangePageSize} value={pageSize} className="border-2 border-indigo-600 rounded-md p-2">
          <option disabled>Page size</option>
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>






      <div className="my-20 space-y-6">
          {data.data.length ? (
          data.data.map(({id,attributes}: {id:number,attributes:{title:string}}) => (
            <div key={id} className="flex items-center even:bg-gray-100 justify-between hover:bg-gray-100 duration-300 p-3 rounded-md">
              <h3 className="w-full font-semibold">
                {id} - {attributes.title}
              </h3>
            </div>
          ))
        ) : (
          <h3>No todos yet!</h3>
        )}
        <Paginator isLoading={isLoading || isFetching} page={page}pageCount={data.meta.pagination.pageCount}total={data.meta.pagination.total} onClickPrev={onClickPrev} onClickNext={onClickNext}/>
      </div>
    </section>

  )
}

export default TodosPage