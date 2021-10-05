export const getConfig = () => {
  const {
    BUCKET_REGION,
    BUCKET_NAME,
    UPLOAD_FOLDER,
    SIGNED_URL_EXPIRATION,
    CATALOG_ITEMS_QUEUE_URL,
  } = process.env;

  return {
    bucketRegion: BUCKET_REGION,
    bucketName: BUCKET_NAME,
    uploadFolder: UPLOAD_FOLDER,
    expration: parseInt(SIGNED_URL_EXPIRATION),
    sqsURL: CATALOG_ITEMS_QUEUE_URL,
  };
};
