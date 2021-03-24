import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import Food, { IFood } from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

type IFoodEditing = Omit<IFood, 'available'>;

export default function Dashboard(){
  const [foods,setFoods] = useState<IFood[]>([]);
  const [editingFood,setEditingFood] = useState<IFoodEditing>({} as IFoodEditing);
  const [modalOpen,setModalOpen] = useState(false);
  const [editModalOpen,setEditModalOpen] = useState(false);

  const handleAddFood = async (food:Omit<IFood,'id' | 'available' >) => {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      }).then(response => response.data);

      setFoods([...foods, response]);
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food:Omit<IFood,'available' >) => {
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods([...foodsUpdated]);
    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id:number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods([...foodsFiltered]);
  }

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  }

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);
  }

  useEffect(()=>{
    async function loadFood(){
      const response = await api.get<IFood[]>('/foods').then(response => response.data); 
      setFoods(response);
    }
    loadFood();
  },[]);

  const handleEditFood = (food:Omit<IFood,'available'>) => {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}