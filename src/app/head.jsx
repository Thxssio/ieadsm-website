export default function Head() {
  const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID || "766585979212640";
  return (
    <>
      <meta property="fb:app_id" content={FB_APP_ID} />
    </>
  );
}
