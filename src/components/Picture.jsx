import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SectionWrapper from "./SectionWrapper";

import { picture1, picture2, picture3, picture4 } from "../assets";

const initialImages = [picture1, picture2, picture3, picture4];

const SWIPE_OFFSET_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

// id stabil per kartu, supaya React tidak bingung meski ada gambar yang
// kebetulan sama, dan urutan tetap terjaga saat kartu dihapus dari depan
const initialCards = initialImages.map((src, id) => ({ id, src }));

function Picture() {
  const [images, setImages] = useState(initialCards);
  const [loadedImages, setLoadedImages] = useState(0);
  const [exitDirection, setExitDirection] = useState(0); // -1 kiri, 1 kanan

  // Dibandingkan ke initialImages.length (bukan images.length) supaya
  // status "sudah loaded" tidak berubah lagi setelah kartu mulai di-swipe
  const allImagesLoaded = loadedImages >= initialImages.length;
  const isFinished = images.length === 0;

  const handleImageLoad = () => {
    setLoadedImages((prev) => prev + 1);
  };

  const removeFrontCard = () => {
    setImages((prev) => prev.slice(1));
  };

  const handleDragEnd = (_event, info) => {
    const { offset, velocity } = info;

    if (offset.x > SWIPE_OFFSET_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      setExitDirection(1);
      removeFrontCard();
    } else if (
      offset.x < -SWIPE_OFFSET_THRESHOLD ||
      velocity.x < -SWIPE_VELOCITY_THRESHOLD
    ) {
      setExitDirection(-1);
      removeFrontCard();
    }
    // kalau tidak melewati threshold, kartu otomatis kembali ke tengah
    // (default behaviour dari drag + dragConstraints)
  };

  return (
    <SectionWrapper>
      {!allImagesLoaded && !isFinished && (
        <div className="absolute inset-0 flex justify-center items-center z-40">
          <p className="text-xl font-medium text-gray-500">Loading images...</p>
        </div>
      )}

      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence>
          {images.map(({ id, src }, index) => {
            const isFront = index === 0;

            return (
              <motion.div
                key={id}
                className={`absolute w-[80%] sm:w-[65%] md:w-[50%] lg:w-[40%] aspect-[3/4] max-h-[75vh] ${
                  allImagesLoaded ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  zIndex: images.length - index,
                  // penting untuk mobile: tanpa ini, gesture drag kartu bentrok
                  // dengan gesture scroll browser dan drag ke-2/ke-3 dst jadi macet
                  touchAction: "none",
                }}
                initial={{
                  scale: 1 - index * 0.04,
                  y: index * 10,
                  rotate: index === 0 ? 0 : (index % 2 === 0 ? -1 : 1) * (4 + index * 2),
                }}
                animate={{
                  scale: 1 - index * 0.04,
                  y: index * 10,
                  rotate: index === 0 ? 0 : (index % 2 === 0 ? -1 : 1) * (4 + index * 2),
                }}
                exit={
                  isFront
                    ? {
                        x: exitDirection * 600,
                        opacity: 0,
                        rotate: exitDirection * 30,
                        transition: { duration: 0.4, ease: "easeOut" },
                      }
                    : { opacity: 0, transition: { duration: 0.2 } }
                }
                transition={{ duration: 0.35, ease: "easeOut" }}
                drag={isFront}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.6}
                whileDrag={{ scale: 1.05, rotate: 0 }}
                onDragEnd={isFront ? handleDragEnd : undefined}
              >
                <img
                  src={src}
                  alt={`Picture ${index + 1}`}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl select-none pointer-events-none"
                  draggable={false}
                  onLoad={handleImageLoad}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {allImagesLoaded && isFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4 z-50 px-4"
          >
            <p className="text-lg sm:text-xl font-medium text-gray-600 text-center">
              That's all the photos!
            </p>
            <Link to="/card">
              <button className="px-6 py-3 sm:px-8 sm:py-4 bg-customBlue text-white rounded-full text-base sm:text-lg font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform">
                Continue ❤️
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  );
}

export default Picture;