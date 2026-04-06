import React, { useEffect, useRef, useState } from "react";
import Nav from "./Nav";
import CategoryCard from "./CategoryCard";
import { categories } from "../../category.js";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const navigate = useNavigate();

  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(
    (store) => store.user,
  );

  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);

  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemList, setUpdatedItemList] = useState(itemsInMyCity);

  const handleFilterByCategory = (category) => {
    if (category == "All") {
      setUpdatedItemList(itemsInMyCity);
    } else {
      const filteredList = itemsInMyCity?.filter((i) => i.category == category);
      setUpdatedItemList(filteredList);
    }
  };

  useEffect(() => {
    setUpdatedItemList(itemsInMyCity);
  }, [itemsInMyCity]);

  const updateButton = (ref, setShowLeftButton, setShowRightButton) => {
    const element = ref.current;

    if (element) {
      setShowLeftButton(element.scrollLeft > 0);

      setShowRightButton(
        element.scrollLeft + element.clientWidth < element.scrollWidth,
      );
    }
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -250 : 250,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const cateElement = cateScrollRef.current;
    const shopElement = shopScrollRef.current;

    const handleScroll = () => {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton,
      );

      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );
    };

    if (cateElement) {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton,
      );

      cateElement.addEventListener("scroll", handleScroll);
    }

    if (shopElement) {
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );

      shopElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (cateElement) cateElement.removeEventListener("scroll", handleScroll);
      if (shopElement) shopElement.removeEventListener("scroll", handleScroll);
    };
  }, [shopInMyCity]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6]">
      <Nav />

      {searchItems && (
        <div className="max-w-6xl mx-auto px-3 sm:px-6 mt-20">
          <div className="bg-white border border-orange-100 shadow-lg rounded-2xl overflow-hidden">
            <h1 className="text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2 p-3">
              Search Results
            </h1>
            {searchItems.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">No items found 😔</div>
            ) : (
              <div className="max-h-80 overflow-y-auto p-3 mb-3">
                {searchItems.map((item) => (
                  <FoodCard data={item} key={item._id} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-6xl mx-auto flex flex-col gap-4 px-3 sm:px-6 py-4">
        <h1 className="text-gray-800 text-lg sm:text-2xl font-semibold">
          Inspiration for your first order
        </h1>

        <div className="relative">
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow z-10"
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft size={20} />
            </button>
          )}

          <div
            className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide"
            ref={cateScrollRef}
          >
            {categories.map((cate, index) => (
              <CategoryCard
                name={cate.category}
                image={cate.image}
                key={index}
                onClick={() => handleFilterByCategory(cate.category)}
              />
            ))}
          </div>

          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow z-10"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaCircleChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Shops */}
      <div className="max-w-6xl mx-auto flex flex-col gap-4 px-3 sm:px-6 py-4">
        <h1 className="text-gray-800 text-lg sm:text-2xl font-semibold">
          Best Shops in {currentCity}
        </h1>

        <div className="relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow z-10"
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaCircleChevronLeft size={20} />
            </button>
          )}

          <div
            className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide"
            ref={shopScrollRef}
          >
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard
                key={index}
                name={shop.name}
                image={shop.image}
                onClick={() => navigate(`/shop/${shop._id}`)}
              />
            ))}
          </div>

          {showRightShopButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow z-10"
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaCircleChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Food Items */}
      <div className="max-w-6xl mx-auto flex flex-col gap-4 px-3 sm:px-6 py-4">
        <h1 className="text-gray-800 text-lg sm:text-2xl font-semibold">
          Suggested Food Items
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {updatedItemList?.map((item, index) => (
            <FoodCard data={item} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
