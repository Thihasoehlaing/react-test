import { useState, useEffect } from 'react'
import { Modal, Ripple, initTE } from "tw-elements";
import './App.css'
import categoriesData from './assets/categories.json';
import newImg from './assets/new.png';
import topImg from './assets/top.png';

const App = () => {
  const [categories] = useState(categoriesData.data);
  const [games, setGames] = useState([]);
  const [jackposts, setJackposts] = useState([]);
  const [selectedCategory, setCategory] = useState('top');
  const [showGames, setShowGames] = useState([]);

  useEffect(() => {
    initTE({ Modal, Ripple });
  }, [])

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('https://stage.whgstage.com/front-end-test/games.php');
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchGames();
  }, []);


  useEffect(() => {
    const fetchJackpots = async () => {
      try {
        const response = await fetch('https://stage.whgstage.com/front-end-test/jackpots.php');
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        setJackposts(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchJackpots();
  }, []);

  useEffect(() => {
    filterGamesByCategory(selectedCategory)
  }, [games, selectedCategory])

  const handleCategory = (value) => {
    setCategory(value)
  }

  const filterGamesByCategory = () => {
    if (games.length > 0) {
      let sampleList;
      if (selectedCategory === 'other') {
        // Filter games by specific keywords for 'other' category
        sampleList = games.filter(game =>
          game.categories.includes('ball') || 
          game.categories.includes('virtual') || 
          game.categories.includes('fun')
        );
      } else if(selectedCategory == 'jackpots'){
        sampleList = games.filter(game =>
          jackposts.some(jackpot => jackpot.game === game.id)
        );
      } else {
        // Filter games by selected category
        sampleList = games.filter(game => game.categories.includes(selectedCategory));
      }

      let updatedGames = sampleList.map(game => {
        let jackpotData = jackposts.find(jackpot => jackpot.game === game.id);
        if (jackpotData) {
          return { ...game, jackpotAmount: jackpotData.amount };
        } else {
          return { ...game, jackpotAmount: 0};
        }
        return game;
      });

      setShowGames(updatedGames);
    }
  }

  const isNew = (gameCategories) => {
    return gameCategories.includes('new');
  }

  const isTop = (gameCategories) => {
    return gameCategories.includes('top');
  }

  const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(number).replace(/[\u200B-\u200D\uFEFF]/g, '');
  }
  
  return (
    <div className="w-full">
      {/* Start Navbar */}
      <div className='w-full bg-[#373737]'>
        <div className='w-full md:container md:mx-auto text-white capitalize flex items-center justify-center md:justify-around'>
          {categories.map((category) => (
            <button 
              key={category.value} 
              className={`px-1 md:px-5 py-4 md:py-4 text-[10px] md:text-xl hover:bg-[#8DC63F] ${category.value == selectedCategory ? 'bg-[#8DC63F]' : ''}`}
              onClick={() => handleCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
      {/* Start Navbar */}

      {/* Start Games Content */}
      <div className='w-full h-full bg-[#FCFCFC]'>
        <div className='container mx-auto py-3 md:py-5 grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4'>
            {
              showGames && showGames.length > 0 && showGames.map((showGame) => (
                <div className='col-span-1' key={showGame.id}>
                  <div 
                    className='w-full relative z-20'
                  >
                    {
                      showGame?.jackpotAmount > 0 && 
                      <div className='w-full absolute top-0 text-center text-white bg-[#80808040] rounded-t-xl'>
                        {formatCurrency(showGame?.jackpotAmount)}
                      </div>
                    }
                    {
                      showGame?.categories && showGame?.categories.length > 0 && isNew(showGame.categories) && 
                      <img src={newImg} className='absolute -top-[11px] -right-[12px] w-[80px] z-10' />
                    }
                    {
                      showGame?.categories && showGame?.categories.length > 0 && isTop(showGame.categories) && 
                      <img src={topImg} className='absolute -bottom-[5px] w-[100px] z-10' />
                    }
                    <div className='relative'>
                      <img src={showGame?.image} alt={showGame?.name} className='rounded-xl z-0' />
                      <div className='play absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 bg-black bg-opacity-50 rounded-xl'>
                        <button 
                          type="button"
                          className='bg-[#8DC63F] text-white text-xs md:text-sm py-2 md:py-4 px-2 md:px-4 rounded-full'
                          data-te-ripple-init
                          data-te-ripple-color="light"
                        >
                          Play
                        </button>
                        <p className='w-full text-xs md:text-lg text-white mt-2 text-center capitalize'>
                          {showGame?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
        </div>
      </div>
      {/* End Games Content */}
    </div>
  )
}

export default App
