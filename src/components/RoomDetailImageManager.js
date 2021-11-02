import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { postFetchForImg } from "../util/api";
import config from "../util/config";
import { validateImage } from "../helper/validation";
import { convertToBlob } from "../util/imageConvert";
import { imageEditor, ImageEditorOption, setFittingToSize, setBackground } from "../util/imageEditor";

const IMAGE_BASE_PATH = config.ReactImagePath.slice(0, -1);

export const RoomDetailImageManager = ({ latestSrc, roomId }) => {
  const [imgSrc, setImgSrc] = useState('')

  useEffect(() => {
    setImgSrc(IMAGE_BASE_PATH + latestSrc)
  }, [latestSrc])

  const uploadImage = async (imgUrl) => {
    setImgSrc(imgUrl);
    const jpegFile = convertToBlob(imgUrl);
    return await postFetchForImg.uploadImage(roomId, jpegFile);
  }

  const handleImageUpload = async (e) => {
    try {
      const reader = new FileReader();
      const file = e.target.files[0];
      try {
        await validateImage(file);
      } catch (e) {
        throw e;
      }
      reader.onloadend = async () => {
        const option = new ImageEditorOption(0xFFFFFFFF, 550, 350)
        await imageEditor(
          reader.result,
          "image/jpeg",
          uploadImage,
          option,
          setFittingToSize,
          setBackground
        )
      }
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Image src={imgSrc} />
      <ImageUploadButton >
        画像の変更
        <ImageUploadInput
          type="file"
          name="user[image]"
          onChange={handleImageUpload}
        />
      </ImageUploadButton>
    </>
  )
}

const Image = styled.img`
  height: 350px;
  width: 550px;
  border-radius: 8px;
`;

const ImageUploadButton = styled.button`
  padding: 20px 30px;
  background: #38bdf8;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-top: 20px;
  margin-left: auto;
  border-radius: 8px;
  font-size: 2.4rem;
  box-shadow: -4px -4px 6px rgba(255, 255, 255, 0.8), 4px 4px 6px rgba(56, 189, 248, 0.5);
`;

const ImageUploadInput = styled.input`
  display: none;
;`
