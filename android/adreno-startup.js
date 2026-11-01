  // Android compatibility: compile the same full-detail scene in small GPU submissions.
  // Resolution, MSAA, strand count, geometry, shaders, textures and final draw are unchanged.
  const renderables=[];
  Zt.traverseVisible(object=>{if(object.geometry&&object.material)renderables.push(object)});
  const breathe=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  let programCursor=t.info.programs.length;
  HSC.startupTiming.adrenoStages=renderables.length;
  HSC.startupTiming.adrenoStagesComplete=0;
  console.info('[HSC_STARTUP] staged_compile_begin '+renderables.length);
  await breathe();
  for(let stageIndex=0;stageIndex<renderables.length;stageIndex++){
    const object=renderables[stageIndex];
    const stage=Zt.clone(false);
    stage.traverseVisible=visit=>object.traverseVisible(visit);
    await t.compileAsync(stage,ze,Zt);
    await HSC.whenYouTubeResumed();
    // Resolve driver reflection while this small submission is current.
    const programs=t.info.programs;
    for(;programCursor<programs.length;programCursor++){
      programs[programCursor].getUniforms();
      programs[programCursor].getAttributes();
    }
    if(t.getContext().isContextLost())throw HSC.graphicsError('GFX_LOST');
    HSC.startupTiming.adrenoStagesComplete=stageIndex+1;
    await breathe();
  }
  HSC.startupTiming.stagedCompileReady=performance.now();
  console.info('[HSC_STARTUP] staged_compile_ready '+renderables.length);
  await HSC.whenYouTubeResumed();
