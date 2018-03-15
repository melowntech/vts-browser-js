
if(Typr  ==null) Typr   = {};
if(Typr.U==null) Typr.U = {};


Typr.U.codeToGlyph = function(font, code)
{
	var cmap = font.cmap;
	
	
	var tind = -1;
	if(cmap.p0e4!=null) tind = cmap.p0e4;
	else if(cmap.p3e1!=null) tind = cmap.p3e1;
	else if(cmap.p1e0!=null) tind = cmap.p1e0;
	
	if(tind==-1) throw "no familiar platform and encoding!";
	
	var tab = cmap.tables[tind];
	
	if(tab.format==0)
	{
		if(code>=tab.map.length) return 0;
		return tab.map[code];
	}
	else if(tab.format==4)
	{
		var sind = -1;
		for(var i=0; i<tab.endCount.length; i++)   if(code<=tab.endCount[i]){  sind=i;  break;  } 
		if(sind==-1) return 0;
		if(tab.startCount[sind]>code) return 0;
		
		var gli = 0;
		if(tab.idRangeOffset[sind]!=0) gli = tab.glyphIdArray[(code-tab.startCount[sind]) + (tab.idRangeOffset[sind]>>1) - (tab.idRangeOffset.length-sind)];
		else                           gli = code + tab.idDelta[sind];
		return gli & 0xFFFF;
	}
	else if(tab.format==12)
	{
		if(code>tab.groups[tab.groups.length-1][1]) return 0;
		for(var i=0; i<tab.groups.length; i++)
		{
			var grp = tab.groups[i];
			if(grp[0]<=code && code<=grp[1]) return grp[2] + (code-grp[0]);
		}
		return 0;
	}
	else throw "unknown cmap table format "+tab.format;
}


Typr.U.glyphToPath = function(font, gid)
{
	var path = { cmds:[], crds:[] };
	if(font.CFF)
	{
		var state = {x:0,y:0,stack:[],nStems:0,haveWidth:false,width: font.CFF.Private ? font.CFF.Private.defaultWidthX : 0,open:false};
		Typr.U._drawCFF(font.CFF.CharStrings[gid], state, font.CFF, path);
	}
	if(font.glyf) Typr.U._drawGlyf(gid, font, path);
	return path;
}

Typr.U._drawGlyf = function(gid, font, path)
{
	var gl = font.glyf[gid];
	if(gl==null) gl = font.glyf[gid] = Typr.glyf._parseGlyf(font, gid);
	if(gl!=null){
		if(gl.noc>-1) Typr.U._simpleGlyph(gl, path);
		else          Typr.U._compoGlyph (gl, font, path);
	}
}
Typr.U._simpleGlyph = function(gl, p)
{
	for(var c=0; c<gl.noc; c++)
	{
		var i0 = (c==0) ? 0 : (gl.endPts[c-1] + 1);
		var il = gl.endPts[c];
		
		for(var i=i0; i<=il; i++)
		{
			var pr = (i==i0)?il:(i-1);
			var nx = (i==il)?i0:(i+1);
			var onCurve = gl.flags[i]&1;
			var prOnCurve = gl.flags[pr]&1;
			var nxOnCurve = gl.flags[nx]&1;
			
			var x = gl.xs[i], y = gl.ys[i];
			
			if(i==i0) { 
				if(onCurve)  
				{
					if(prOnCurve) Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]); 
					else          {  Typr.U.P.moveTo(p,x,y);  continue;  /*  will do curveTo at il  */  }
				}
				else        
				{
					if(prOnCurve) Typr.U.P.moveTo(p,  gl.xs[pr],       gl.ys[pr]        );
					else          Typr.U.P.moveTo(p, (gl.xs[pr]+x)/2, (gl.ys[pr]+y)/2   ); 
				}
			}
			if(onCurve)
			{
				if(prOnCurve) Typr.U.P.lineTo(p,x,y);
			}
			else
			{
				if(nxOnCurve) Typr.U.P.qcurveTo(p, x, y, gl.xs[nx], gl.ys[nx]); 
				else          Typr.U.P.qcurveTo(p, x, y, (x+gl.xs[nx])/2, (y+gl.ys[nx])/2); 
			}
		}
		Typr.U.P.closePath(p);
	}
}
Typr.U._compoGlyph = function(gl, font, p)
{
	for(var j=0; j<gl.parts.length; j++)
	{
		var path = { cmds:[], crds:[] };
		var prt = gl.parts[j];
		Typr.U._drawGlyf(prt.glyphIndex, font, path);
		
		var m = prt.m;
		for(var i=0; i<path.crds.length; i+=2)
		{
			var x = path.crds[i  ], y = path.crds[i+1];
			p.crds.push(x*m.a + y*m.b + m.tx);
			p.crds.push(x*m.c + y*m.d + m.ty);
		}
		for(var i=0; i<path.cmds.length; i++) p.cmds.push(path.cmds[i]);
	}
}


Typr.U._getGlyphClass = function(g, cd)
{
	for(var i=0; i<cd.start.length; i++) 
		if(cd.start[i]<=g && cd.end[i]>=g) return cd.class[i];
	return 0;
}

Typr.U.getPairAdjustment = function(font, g1, g2)
{
	if(font.GPOS)
	{
		var ltab = null;
		for(var i=0; i<font.GPOS.featureList.length; i++) 
		{
			var fl = font.GPOS.featureList[i];
			if(fl.tag=="kern")
				for(var j=0; j<fl.tab.length; j++) 
					if(font.GPOS.lookupList[fl.tab[j]].ltype==2) ltab=font.GPOS.lookupList[fl.tab[j]];
		}
		if(ltab)
		{
			var adjv = 0;
			for(var i=0; i<ltab.tabs.length; i++)
			{
				var tab = ltab.tabs[i];
				var ind = Typr._lctf.coverageIndex(tab.coverage, g1);
				if(ind==-1) continue;
				var adj;
				if(tab.format==1)
				{
					var right = tab.pairsets[ind];
					for(var j=0; j<right.length; j++) if(right[j].gid2==g2) adj = right[j];
					if(adj==null) continue;
				}
				else if(tab.format==2)
				{
					var c1 = Typr.U._getGlyphClass(g1, tab.classDef1);
					var c2 = Typr.U._getGlyphClass(g2, tab.classDef2);
					var adj = tab.matrix[c1][c2];
				}
				return adj.val1[2];
			}
		}
	}
	if(font.kern)
	{
		var ind1 = font.kern.glyph1.indexOf(g1);
		if(ind1!=-1)
		{
			var ind2 = font.kern.rval[ind1].glyph2.indexOf(g2);
			if(ind2!=-1) return font.kern.rval[ind1].vals[ind2];
		}
	}
	
	return 0;
}

Typr.U.stringToGlyphs = function(font, str)
{
	var gls = [];
	for(var i=0; i<str.length; i++) gls.push(Typr.U.codeToGlyph(font, str.charCodeAt(i)));
	
	//console.log(gls);  return gls;
	
	var gsub = font["GSUB"];  if(gsub==null) return gls;
	var llist = gsub.lookupList, flist = gsub.featureList;
	
	var wsep = "\n\t\" ,.:;!?()  ،";
	var R = "آأؤإاةدذرزوٱٲٳٵٶٷڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙۀۃۄۅۆۇۈۉۊۋۍۏےۓەۮۯܐܕܖܗܘܙܞܨܪܬܯݍݙݚݛݫݬݱݳݴݸݹࡀࡆࡇࡉࡔࡧࡩࡪࢪࢫࢬࢮࢱࢲࢹૅેૉ૊૎૏ૐ૑૒૝ૡ૤૯஁ஃ஄அஉ஌எஏ஑னப஫஬";
	var L = "ꡲ્૗";
	
	for(var ci=0; ci<gls.length; ci++) {
		var gl = gls[ci];
		
		var slft = ci==0            || wsep.indexOf(str[ci-1])!=-1;
		var srgt = ci==gls.length-1 || wsep.indexOf(str[ci+1])!=-1;
		
		if(!slft && R.indexOf(str[ci-1])!=-1) slft=true;
		if(!srgt && R.indexOf(str[ci  ])!=-1) srgt=true;
		
		if(!srgt && L.indexOf(str[ci+1])!=-1) srgt=true;
		if(!slft && L.indexOf(str[ci  ])!=-1) slft=true;
		
		var feat = null;
		if(slft) feat = srgt ? "isol" : "init";
		else     feat = srgt ? "fina" : "medi";
		
		for(var fi=0; fi<flist.length; fi++)
		{
			if(flist[fi].tag!=feat) continue;
			for(var ti=0; ti<flist[fi].tab.length; ti++)
			{
				var tab = llist[flist[fi].tab[ti]];
				if(tab.ltype!=1) continue;
				for(var j=0; j<tab.tabs.length; j++)
				{
					var ttab = tab.tabs[j];
					var ind = Typr._lctf.coverageIndex(ttab.coverage,gl);  if(ind==-1) continue;  
					if(ttab.fmt==0) gls[ci] = ind+ttab.delta;
					else            gls[ci] = ttab.newg[ind];
					//console.log(ci, gl, "subst", flist[fi].tag, i, j, ttab.newg[ind]);
				}
			}
		}
	}
	var cligs = ["rlig", "liga"];
	
	for(var ci=0; ci<gls.length; ci++) {
		var gl = gls[ci];
		var rlim = Math.min(3, gls.length-ci-1);
		for(var fi=0; fi<flist.length; fi++)
		{
			
			var fl = flist[fi];  if(cligs.indexOf(fl.tag)==-1) continue;
			for(var ti=0; ti<fl.tab.length; ti++)
			{
				var tab = llist[fl.tab[ti]];
				if(tab.ltype!=4) continue;
				for(var j=0; j<tab.tabs.length; j++)
				{
					var ind = Typr._lctf.coverageIndex(tab.tabs[j].coverage, gl);  if(ind==-1) continue;  
					var vals = tab.tabs[j].vals[ind];
					
					for(var k=0; k<vals.length; k++) {
						var lig = vals[k], rl = lig.chain.length;  if(rl>rlim) continue;
						var good = true;
						for(var l=0; l<rl; l++) if(lig.chain[l]!=gls[ci+(1+l)]) good=false;
						if(!good) continue;
						gls[ci]=lig.nglyph;
						for(var l=0; l<rl; l++) gls[ci+l+1]=-1;
						//console.log("lig", fl.tag,  gl, lig.chain, lig.nglyph);
					}
				}
			}
		}
	}
	return gls;
}

Typr.U.glyphsToPath = function(font, gls)
{	
	//gls = gls.reverse();//gls.slice(0,12).concat(gls.slice(12).reverse());
	
	var tpath = {cmds:[], crds:[]};
	var x = 0;
	
	for(var i=0; i<gls.length; i++)
	{
		var gid = gls[i];  if(gid==-1) continue;
		var gid2 = (i<gls.length-1 && gls[i+1]!=-1)  ? gls[i+1] : 0;
		var path = Typr.U.glyphToPath(font, gid);
		
		for(var j=0; j<path.crds.length; j+=2)
		{
			tpath.crds.push(path.crds[j] + x);
			tpath.crds.push(path.crds[j+1]);
		}
		for(var j=0; j<path.cmds.length; j++) tpath.cmds.push(path.cmds[j]);
		x += font.hmtx.aWidth[gid];
		if(i<gls.length-1) x += Typr.U.getPairAdjustment(font, gid, gid2);
	}
	return tpath;
}

Typr.U.pathToSVG = function(path, prec)
{
	if(prec==null) prec = 5;
	var out = [], co = 0, lmap = {"M":2,"L":2,"Q":4,"C":6};
	for(var i=0; i<path.cmds.length; i++)
	{
		var cmd = path.cmds[i], cn = co+(lmap[cmd]?lmap[cmd]:0);  
		out.push(cmd);
		while(co<cn) {  var c = path.crds[co++];  out.push(parseFloat(c.toFixed(prec))+(co==cn?"":" "));  }
	}
	return out.join("");
}

Typr.U.pathToContext = function(path, ctx, pos, scale)
{
	var c = 0, crds = path.crds;
	
	for(var j=0; j<path.cmds.length; j++)
	{
		var cmd = path.cmds[j];
		if     (cmd=="M")
		{
			ctx.moveTo((crds[c] * scale) + pos[0] , (crds[c+1] * -scale) + pos[1] );
			c+=2;
		}
		else if(cmd=="L")
		{
			ctx.lineTo((crds[c] * scale) + pos[0] , (crds[c+1] * -scale) + pos[1] );
			c+=2;
		}
		else if(cmd=="C")
		{
			ctx.bezierCurveTo((crds[c] * scale) + pos[0] , (crds[c+1] * -scale) + pos[1] ,
				              (crds[c+2] * scale) + pos[0] , (crds[c+3] * -scale) + pos[1] ,
				              (crds[c+4] * scale) + pos[0] , (crds[c+5] * -scale) + pos[1] );
			c+=6;
		}
		else if(cmd=="Q")
		{
			ctx.quadraticCurveTo((crds[c] * scale) + pos[0] , (crds[c+1] * -scale) + pos[1] ,
				                 (crds[c+2] * scale) + pos[0] , (crds[c+3] * -scale) + pos[1] );
			c+=4;
		}
		else if(cmd=="Z")  ctx.closePath();
	}
}


Typr.U.P = {};
Typr.U.P.moveTo = function(p, x, y)
{
	p.cmds.push("M");  p.crds.push(x,y);
}
Typr.U.P.lineTo = function(p, x, y)
{
	p.cmds.push("L");  p.crds.push(x,y);
}
Typr.U.P.curveTo = function(p, a,b,c,d,e,f)
{
	p.cmds.push("C");  p.crds.push(a,b,c,d,e,f);
}
Typr.U.P.qcurveTo = function(p, a,b,c,d)
{
	p.cmds.push("Q");  p.crds.push(a,b,c,d);
}
Typr.U.P.closePath = function(p) {  p.cmds.push("Z");  }




