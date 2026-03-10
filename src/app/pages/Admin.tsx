import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Admin() {
  const getFetchSB = async () => {};
  const getPosts = async () => {
    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .order("created_at", { ascending: false });
    console.log(data);
    return { data, error };
  };

  useEffect(() => {
    getPosts();
  }, []);
  return (
    <div>
      <h1>Admin</h1>
    </div>
  );
}

/* 
// 1. Create (데이터 추가)
const createPost = async (newPost: Post) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([newPost])
    .select(); // 추가된 데이터를 바로 반환받고 싶을 때 사용
  return { data, error };
};

// 2. Read (데이터 조회)
const getPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

// 3. Update (데이터 수정)
const updatePost = async (id: number, updates: Partial<Post>) => {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id);
  return { data, error };
};

// 4. Delete (데이터 삭제)
const deletePost = async (id: number) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);
  return { error };
};
*/
