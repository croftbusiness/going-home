import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('legacy_recipes')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const recipes = data?.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      photoUrl: recipe.photo_url,
      storyBehindRecipe: recipe.story_behind_recipe,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    })) || [];

    return NextResponse.json({ recipes });
  } catch (error: any) {
    console.error('Recipes GET error:', error);
    return NextResponse.json({ error: 'Failed to load recipes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('legacy_recipes')
      .insert({
        user_id: auth.userId,
        title: body.title,
        ingredients: body.ingredients,
        instructions: body.instructions,
        photo_url: body.photoUrl || null,
        story_behind_recipe: body.storyBehindRecipe || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      recipe: {
        id: data.id,
        title: data.title,
        ingredients: data.ingredients,
        instructions: data.instructions,
        photoUrl: data.photo_url,
        storyBehindRecipe: data.story_behind_recipe,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Recipes POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save recipe' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('legacy_recipes')
      .update({
        title: body.title,
        ingredients: body.ingredients,
        instructions: body.instructions,
        photo_url: body.photoUrl || null,
        story_behind_recipe: body.storyBehindRecipe || null,
      })
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      recipe: {
        id: data.id,
        title: data.title,
        ingredients: data.ingredients,
        instructions: data.instructions,
        photoUrl: data.photo_url,
        storyBehindRecipe: data.story_behind_recipe,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Recipes PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('legacy_recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Recipes DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}

